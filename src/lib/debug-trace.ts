import type {
  BadgeDisplayItem,
  BadgeRuleConfig,
  BadgeShelfItem,
  DbDebugTable,
  DbSchemaColumn,
  DebugBadgeShelfSetupRow,
  DebugTrace,
  SonyCustomerProducts,
} from "@/types/badge";
import { describeRuleCondition } from "@/lib/badge-shelf";
import { getReadableSkuLabel } from "@/lib/sku-labels";

export type DebugTraceInput = {
  customerProducts: SonyCustomerProducts;
  rules: BadgeRuleConfig[];
  badges: BadgeDisplayItem[];
  badgeShelf: BadgeShelfItem[];
  dbSchema?: DbSchemaColumn[];
  dbTables?: DbDebugTable[];
};

export function buildDebugTrace({
  customerProducts,
  rules,
  badges,
  badgeShelf,
  dbSchema = [],
  dbTables = [],
}: DebugTraceInput): DebugTrace {
  return {
    dbRules: {
      schema: dbSchema,
      tables: dbTables,
      badgeShelfSetup: buildBadgeShelfSetup({ rules, badgeShelf }),
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
        skuLabel: getReadableSkuLabel(product.sku),
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

function buildBadgeShelfSetup({
  rules,
  badgeShelf,
}: {
  rules: BadgeRuleConfig[];
  badgeShelf: BadgeShelfItem[];
}): DebugBadgeShelfSetupRow[] {
  return rules.flatMap((rule) => {
    const thresholds = [...rule.thresholds].sort(
      (left, right) =>
        left.requiredCount - right.requiredCount ||
        left.displayName.localeCompare(right.displayName) ||
        left.level.localeCompare(right.level),
    );
    const skuAmount =
      (rule.conditions?.length ?? 0) > 0
        ? rule.conditions?.reduce((total, condition) => total + condition.sonySkus.length, 0) ?? 0
        : rule.skus.length;
    const logicTooltip =
      (rule.conditions?.length ?? 0) > 0
        ? describeRuleCondition(rule, Math.max(...thresholds.map((threshold) => threshold.requiredCount), 1))
        : rule.skus.length > 0
          ? `Match any owned SKU from ${rule.skus.length} configured SKU(s).`
          : "No conditions configured.";

    return thresholds.map((threshold) => {
      const shelfItem = badgeShelf.find(
        (badge) => badge.ruleCode === rule.code && badge.level === threshold.level,
      );

      return {
        badgeCode: rule.code,
        badgeName: rule.name,
        category:
          rule.displayCategory ??
          (rule.badgeType === "product" ? "Product ownership badge" : "Achievement badge"),
        group: rule.displayGroup ?? null,
        activeFrom: rule.activeFrom,
        activeTo: rule.activeTo,
        registrationStart: rule.registrationStart,
        registrationEnd: rule.registrationEnd,
        level: threshold.level,
        displayName: threshold.displayName,
        conditionText: shelfItem?.ruleConditionText ?? logicTooltip,
        status: shelfItem?.status ?? "-",
        progress: shelfItem?.progress ?? null,
        matchedCount: shelfItem?.matchedCount ?? null,
        requiredCount: threshold.requiredCount,
        skuAmount,
        logicTooltip,
        achievedImageUrl: threshold.achievedImageUrl,
        lockedImageUrl: threshold.lockedImageUrl,
      };
    });
  });
}
