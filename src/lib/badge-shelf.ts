import { calculateRuleMatch, isRuleActive } from "@/lib/badge-engine";
import type { BadgeRuleConfig, BadgeShelfItem, SonyOwnedProduct } from "@/types/badge";

type BuildBadgeShelfInput = {
  products: SonyOwnedProduct[];
  rules: BadgeRuleConfig[];
  now?: Date;
};

type RuleConditionDescriptionInput = Pick<BadgeRuleConfig, "skus" | "conditions">;

function clampProgress(matchedCount: number, requiredCount: number): number {
  if (requiredCount <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((matchedCount / requiredCount) * 100));
}

export function describeRuleCondition(
  rule: RuleConditionDescriptionInput,
  thresholdRequiredCount: number,
): string {
  const conditions = rule.conditions ?? [];

  if (conditions.length === 0) {
    return rule.skus.length > 0
      ? `Own any 1 of ${rule.skus.length} eligible SKU(s)`
      : "No SKU condition configured";
  }

  return conditions
    .map((condition) => {
      const skuCount = condition.sonySkus.length;

      if (condition.matchType === "all") {
        return `${condition.label}: own all ${skuCount}`;
      }

      if (condition.matchType === "min_count") {
        const displayRequiredCount =
          conditions.length === 1
            ? Math.min(thresholdRequiredCount, skuCount)
            : condition.requiredCount;

        return `${condition.label}: own ${displayRequiredCount} of ${skuCount}`;
      }

      return `${condition.label}: own any 1 of ${skuCount}`;
    })
    .join("; ");
}

export function buildBadgeShelf({
  products,
  rules,
  now = new Date(),
}: BuildBadgeShelfInput): BadgeShelfItem[] {
  return rules
    .filter((rule) => isRuleActive(rule, now))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .flatMap((rule) => {
      const { matchedCount } = calculateRuleMatch(rule, products);

      return [...rule.thresholds]
        .sort(
          (left, right) =>
            (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.requiredCount - right.requiredCount,
        )
        .map((threshold) => {
          const achieved = matchedCount >= threshold.requiredCount;
          const label = threshold.displayName;
          const shelfMatchedCount = Math.min(matchedCount, threshold.requiredCount);

          return {
            code: `${rule.code}-${threshold.level}`,
            ruleCode: rule.code,
            level: threshold.level,
            label,
            title: `${rule.name} ${label}`,
            category: rule.displayCategory ?? (rule.badgeType === "product" ? "Product ownership badge" : "Achievement badge"),
            group: rule.displayGroup ?? null,
            description: rule.description ?? `Unlock ${rule.name} ${label}.`,
            ruleConditionText: describeRuleCondition(rule, threshold.requiredCount),
            imageUrl: achieved
              ? threshold.achievedImageUrl
              : (threshold.lockedImageUrl ?? threshold.achievedImageUrl),
            status: achieved ? "achieved" : "available",
            visualState: achieved ? "color" : "dimmed",
            matchedCount: shelfMatchedCount,
            requiredCount: threshold.requiredCount,
            progress: clampProgress(shelfMatchedCount, threshold.requiredCount),
          } satisfies BadgeShelfItem;
        });
    });
}
