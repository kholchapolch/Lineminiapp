import "server-only";

import { createHash } from "node:crypto";
import { loadAppConfig, type AppConfig } from "@/lib/app-config";
import { calculateBadges } from "@/lib/badge-engine";
import { buildDebugTrace } from "@/lib/debug-trace";
import { buildBadgeShelf } from "@/lib/badge-shelf";
import {
  getActiveBadgeRules,
  getBadgeRuntimeConfig,
  getDebugDbTables,
  getPublicDbSchema,
  writeBadgeCalculationLog,
} from "@/lib/badge-repository";
import { hashLineUuid } from "@/lib/safe-logging";
import { normalizeSku } from "@/lib/sku";
import { createSonyProductsClient } from "@/lib/sony-products-client";
import { SonyCustomerNotFoundError } from "@/lib/sony-products";
import { toSafeError } from "@/lib/safe-logging";
import type {
  BadgeApiCacheHitPayload,
  BadgeDisplayItem,
  BadgeResultPayload,
  BadgeCacheMetadata,
  CalculatedBadge,
  SonyCustomerProducts,
} from "@/types/badge";

export async function getBadgeResultForLineUuid(
  lineuuid: string,
  options: {
    config?: AppConfig;
    includeDebugTrace?: boolean;
    cacheHint?: Partial<Pick<BadgeCacheMetadata, "customerCacheKey" | "skuHash" | "rulesVersion">>;
  } = {},
): Promise<BadgeResultPayload | BadgeApiCacheHitPayload> {
  const config = options.config ?? loadAppConfig();

  try {
    const customerProducts = await createSonyProductsClient(config).getCustomerProducts(lineuuid);
    const runtimeConfig = await getBadgeRuntimeConfig();
    const cache = buildBadgeCacheMetadata({
      lineuuid,
      products: customerProducts.products,
      rulesVersion: runtimeConfig.badgeRulesVersion,
    });

    if (!options.includeDebugTrace && isCacheHintMatch(options.cacheHint, cache)) {
      return {
        cacheStatus: "hit",
        customer: {
          displayName: customerProducts.customer.displayName,
          lineDisplayName: customerProducts.customer.lineDisplayName,
          linePictureUrl: customerProducts.customer.linePictureUrl,
        },
        productCount: customerProducts.products.length,
        supportMessage: runtimeConfig.supportMessage,
        cache,
      };
    }

    const rules = await getActiveBadgeRules({
      version: runtimeConfig.badgeRulesVersion,
      bypassCache: options.includeDebugTrace,
    });
    const badges = calculateBadges({ products: customerProducts.products, rules });
    const payload = toBadgeResultPayload(
      customerProducts,
      badges.map(toDisplayBadge),
      buildBadgeShelf({ products: customerProducts.products, rules }),
      runtimeConfig.supportMessage,
      cache,
    );

    if (options.includeDebugTrace) {
      payload.debugTrace = buildDebugTrace({
        customerProducts,
        rules,
        badges: payload.badges,
        badgeShelf: payload.badgeShelf,
        dbSchema: await getPublicDbSchema(),
        dbTables: await getDebugDbTables(),
      });
    }

    void writeBadgeCalculationLog({
      lineuuid,
      sourceProductCount: customerProducts.products.length,
      matchedSkuCount: payload.badges.reduce((total, badge) => total + badge.matchedCount, 0),
      resultSummary: payload.badges.map((badge) => ({
        code: badge.code,
        status: badge.status,
        matchedCount: badge.matchedCount,
      })),
    }).catch(() => undefined);

    return payload;
  } catch (error) {
    void writeBadgeCalculationLog({
      lineuuid,
      sourceProductCount: 0,
      matchedSkuCount: 0,
      resultSummary: [],
      errorCode: toSafeError(error).code,
      errorMessage: toSafeError(error).message,
    }).catch(() => undefined);
    throw error;
  }
}

function isCacheHintMatch(
  hint: Partial<Pick<BadgeCacheMetadata, "customerCacheKey" | "skuHash" | "rulesVersion">> | undefined,
  cache: BadgeCacheMetadata,
): boolean {
  return (
    hint?.customerCacheKey === cache.customerCacheKey &&
    hint.skuHash === cache.skuHash &&
    hint.rulesVersion === cache.rulesVersion
  );
}

function buildBadgeCacheMetadata({
  lineuuid,
  products,
  rulesVersion,
}: {
  lineuuid: string;
  products: SonyCustomerProducts["products"];
  rulesVersion: string;
}): BadgeCacheMetadata {
  return {
    customerCacheKey: hashLineUuid(lineuuid),
    skuHash: hashProductSkus(products),
    rulesVersion,
    calculatedAt: new Date().toISOString(),
  };
}

function hashProductSkus(products: SonyCustomerProducts["products"]): string {
  const normalizedSkus = Array.from(
    new Set(products.map((product) => normalizeSku(product.sku))),
  ).sort((left, right) => left.localeCompare(right));

  return createHash("sha256").update(normalizedSkus.join("|")).digest("hex");
}

function toBadgeResultPayload(
  customerProducts: SonyCustomerProducts,
  badges: BadgeDisplayItem[],
  badgeShelf: ReturnType<typeof buildBadgeShelf>,
  supportMessage: string,
  cache: BadgeCacheMetadata,
): BadgeResultPayload {
  return {
    customer: customerProducts.customer,
    products: customerProducts.products,
    supportMessage,
    badges,
    badgeShelf,
    cache,
  };
}

function toDisplayBadge(badge: CalculatedBadge): BadgeDisplayItem {
  const firstProduct = badge.matchedProducts[0] ?? null;
  const type = badge.badgeType;

  return {
    code: badge.code,
    name: badge.displayName ? `${badge.name} - ${badge.displayName}` : badge.name,
    type,
    description: badge.description,
    status: badge.status,
    progress: badge.progress,
    remainingCount: badge.remainingCount,
    matchedCount: badge.matchedCount,
    requiredCount: badge.requiredCount,
    imageUrl: badge.imageUrl,
    serialNumber: firstProduct?.serialNumber ?? null,
    modelName: firstProduct?.modelName ?? null,
    registrationDate: firstProduct?.registeredAt ?? null,
    level: badge.level,
  };
}

export function isSonyCustomerNotFound(error: unknown): boolean {
  return error instanceof SonyCustomerNotFoundError;
}
