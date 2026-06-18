import type {
  BadgeDisplayItem,
  BadgeRuleConfig,
  BadgeShelfItem,
  DebugTrace,
  SonyCustomerProducts,
} from "@/types/badge";

export type DebugTraceInput = {
  customerProducts: SonyCustomerProducts;
  rules: BadgeRuleConfig[];
  badges: BadgeDisplayItem[];
  badgeShelf: BadgeShelfItem[];
};

export function buildDebugTrace({
  customerProducts,
  rules,
  badges,
  badgeShelf,
}: DebugTraceInput): DebugTrace {
  return {
    dbRules: {
      rules: rules
        .map((rule) => ({
          id: rule.id,
          code: rule.code,
          name: rule.name,
          ruleType: rule.ruleType,
          sortOrder: rule.sortOrder,
          isActive: rule.isActive,
          activeFrom: rule.activeFrom,
          activeTo: rule.activeTo,
          registrationStart: rule.registrationStart,
          registrationEnd: rule.registrationEnd,
          skus: [...rule.skus].sort((left, right) => left.localeCompare(right)),
          thresholds: [...rule.thresholds]
            .sort(
              (left, right) =>
                left.requiredCount - right.requiredCount ||
                left.displayName.localeCompare(right.displayName) ||
                left.level.localeCompare(right.level),
            )
            .map((threshold) => ({
              level: threshold.level,
              displayName: threshold.displayName,
              requiredCount: threshold.requiredCount,
              imageUrl: threshold.imageUrl,
              lockedImageUrl: threshold.lockedImageUrl,
            })),
        }))
        .sort(
          (left, right) =>
            left.sortOrder - right.sortOrder ||
            left.name.localeCompare(right.name) ||
            left.code.localeCompare(right.code),
        ),
    },
    sonyApiMock: {
      customer: {
        lineuuidPresent: Boolean(customerProducts.customer.lineuuid),
        customerIdPresent: Boolean(customerProducts.customer.customerId),
        displayNamePresent: Boolean(customerProducts.customer.displayName),
        lineDisplayNamePresent: Boolean(customerProducts.customer.lineDisplayName),
        linePictureUrlPresent: Boolean(customerProducts.customer.linePictureUrl),
      },
      products: customerProducts.products.map((product) => ({
        sku: product.sku,
        modelNamePresent: Boolean(product.modelName),
        serialNumberPresent: Boolean(product.serialNumber),
        registeredAtPresent: Boolean(product.registeredAt),
      })),
    },
    aggregationResult: {
      summary: {
        sourceProductCount: customerProducts.products.length,
        badgeShelfCount: badgeShelf.length,
        detailedBadgeCount: badges.length,
        achievedShelfCount: badgeShelf.filter((badge) => badge.status === "achieved").length,
      },
      badgeShelf,
      ruleMatches: badges.map((badge) => ({
        code: badge.code,
        name: badge.name,
        status: badge.status,
        matchedCount: badge.matchedCount,
        requiredCount: badge.requiredCount,
        remainingCount: badge.remainingCount,
        progress: badge.progress,
        level: badge.level ?? null,
        serialNumberPresent: Boolean(badge.serialNumber),
        modelNamePresent: Boolean(badge.modelName),
        registrationDatePresent: Boolean(badge.registrationDate),
      })),
      badges: badges.map((badge) => ({
        code: badge.code,
        name: badge.name,
        type: badge.type,
        status: badge.status,
        progress: badge.progress,
        matchedCount: badge.matchedCount,
        requiredCount: badge.requiredCount,
        remainingCount: badge.remainingCount,
        level: badge.level ?? null,
        imageUrl: badge.imageUrl,
      })),
    },
  };
}
