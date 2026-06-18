import "server-only";

import { calculateBadges } from "@/lib/badge-engine";
import { buildDebugTrace } from "@/lib/debug-trace";
import { buildBadgeShelf } from "@/lib/badge-shelf";
import { getActiveBadgeRules, getSupportMessage, writeBadgeCalculationLog } from "@/lib/badge-repository";
import { getMockSonyCustomerProducts, SonyCustomerNotFoundError } from "@/lib/sony-products";
import { toSafeError } from "@/lib/safe-logging";
import type {
  BadgeDisplayItem,
  BadgeResultPayload,
  CalculatedBadge,
  SonyCustomerProducts,
} from "@/types/badge";

export async function getBadgeResultForLineUuid(
  lineuuid: string,
  options: { includeDebugTrace?: boolean } = {},
): Promise<BadgeResultPayload> {
  try {
    const customerProducts = await getSonyCustomerProducts(lineuuid);
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
      });
    }

    await writeBadgeCalculationLog({
      lineuuid,
      sourceProductCount: customerProducts.products.length,
      matchedSkuCount: payload.badges.reduce((total, badge) => total + badge.matchedCount, 0),
      resultSummary: payload.badges.map((badge) => ({
        code: badge.code,
        status: badge.status,
        matchedCount: badge.matchedCount,
      })),
    });

    return payload;
  } catch (error) {
    await writeBadgeCalculationLog({
      lineuuid,
      sourceProductCount: 0,
      matchedSkuCount: 0,
      resultSummary: [],
      errorCode: toSafeError(error).code,
      errorMessage: toSafeError(error).message,
    });
    throw error;
  }
}

async function getSonyCustomerProducts(lineuuid: string): Promise<SonyCustomerProducts> {
  // The live Sony adapter will replace this function once endpoint/auth are confirmed.
  return getMockSonyCustomerProducts(lineuuid);
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
  const type = badge.ruleType === "tier" ? "product" : "quest";

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
