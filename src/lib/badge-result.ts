import "server-only";

import { loadAppConfig, type AppConfig } from "@/lib/app-config";
import { calculateBadges } from "@/lib/badge-engine";
import { buildDebugTrace } from "@/lib/debug-trace";
import { buildBadgeShelf } from "@/lib/badge-shelf";
import {
  getActiveBadgeRules,
  getDebugDbTables,
  getPublicDbSchema,
  getSupportMessage,
  writeBadgeCalculationLog,
} from "@/lib/badge-repository";
import { createSonyProductsClient } from "@/lib/sony-products-client";
import { SonyCustomerNotFoundError } from "@/lib/sony-products";
import { toSafeError } from "@/lib/safe-logging";
import type {
  BadgeDisplayItem,
  BadgeResultPayload,
  CalculatedBadge,
  SonyCustomerProducts,
} from "@/types/badge";

export async function getBadgeResultForLineUuid(
  lineuuid: string,
  options: { config?: AppConfig; includeDebugTrace?: boolean } = {},
): Promise<BadgeResultPayload> {
  const config = options.config ?? loadAppConfig();

  try {
    const customerProducts = await createSonyProductsClient(config).getCustomerProducts(lineuuid);
    const rules = await getActiveBadgeRules();
    const badges = calculateBadges({ products: customerProducts.products, rules });
    const payload = toBadgeResultPayload(
      customerProducts,
      badges.map(toDisplayBadge),
      buildBadgeShelf({ products: customerProducts.products, rules }),
      await getSupportMessage(),
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

function toBadgeResultPayload(
  customerProducts: SonyCustomerProducts,
  badges: BadgeDisplayItem[],
  badgeShelf: ReturnType<typeof buildBadgeShelf>,
  supportMessage: string,
): BadgeResultPayload {
  return {
    customer: customerProducts.customer,
    products: customerProducts.products,
    supportMessage,
    badges,
    badgeShelf,
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
