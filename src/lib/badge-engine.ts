import { matchesEligibleSku, normalizeSku } from "@/lib/sku";
import type {
  BadgeRuleConfig,
  BadgeThresholdConfig,
  CalculatedBadge,
  SonyOwnedProduct,
} from "@/types/badge";

type CalculateBadgesInput = {
  products: SonyOwnedProduct[];
  rules: BadgeRuleConfig[];
  now?: Date;
};

function toDate(value: string | null): Date | null {
  return value ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`) : null;
}

export function isWithinDateWindow(value: string, start: string | null, end: string | null): boolean {
  const date = toDate(value);
  const startsAt = toDate(start);
  const endsAt = toDate(end);

  if (!date) {
    return false;
  }

  if (startsAt && date < startsAt) {
    return false;
  }

  if (endsAt && date > endsAt) {
    return false;
  }

  return true;
}

export function isRuleActive(rule: BadgeRuleConfig, now: Date): boolean {
  if (!rule.isActive) {
    return false;
  }

  const activeFrom = toDate(rule.activeFrom);
  const activeTo = toDate(rule.activeTo);

  if (activeFrom && now < activeFrom) {
    return false;
  }

  if (activeTo && now > activeTo) {
    return false;
  }

  return true;
}

function sortedThresholds(rule: BadgeRuleConfig): BadgeThresholdConfig[] {
  return [...rule.thresholds].sort(
    (left, right) =>
      left.requiredCount - right.requiredCount ||
      (left.sortOrder ?? 0) - (right.sortOrder ?? 0),
  );
}

function clampProgress(matchedCount: number, requiredCount: number): number {
  if (requiredCount <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((matchedCount / requiredCount) * 100));
}

function uniqueEligibleProducts(
  products: SonyOwnedProduct[],
  skus: string[],
  rule: BadgeRuleConfig,
): SonyOwnedProduct[] {
  const matchedBySku = new Map<string, SonyOwnedProduct>();

  for (const product of products) {
    const normalizedSku = normalizeSku(product.sku);

    if (
      matchesEligibleSku(product.sku, skus) &&
      isWithinDateWindow(product.registeredAt, rule.registrationStart, rule.registrationEnd) &&
      !matchedBySku.has(normalizedSku)
    ) {
      matchedBySku.set(normalizedSku, product);
    }
  }

  return Array.from(matchedBySku.values());
}

export function calculateRuleMatch(rule: BadgeRuleConfig, products: SonyOwnedProduct[]): {
  matchedCount: number;
  matchedProducts: SonyOwnedProduct[];
} {
  const conditions = rule.conditions ?? [];

  if (conditions.length === 0) {
    const matchedProducts = uniqueEligibleProducts(products, rule.skus, rule);

    return { matchedCount: matchedProducts.length, matchedProducts };
  }

  const matchedBySku = new Map<string, SonyOwnedProduct>();
  let matchedCount = 0;

  for (const condition of conditions) {
    const conditionProducts = uniqueEligibleProducts(products, condition.sonySkus, rule);
    const conditionRequiredCount =
      condition.matchType === "all" ? condition.sonySkus.length : condition.requiredCount;
    const cappedConditionCount = Math.min(conditionProducts.length, conditionRequiredCount);

    matchedCount += cappedConditionCount;

    for (const product of conditionProducts) {
      matchedBySku.set(normalizeSku(product.sku), product);
    }
  }

  return { matchedCount, matchedProducts: Array.from(matchedBySku.values()) };
}

export function calculateBadges({
  products,
  rules,
  now = new Date(),
}: CalculateBadgesInput): CalculatedBadge[] {
  return rules
    .filter((rule) => isRuleActive(rule, now))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .map((rule) => {
      const { matchedCount, matchedProducts } = calculateRuleMatch(rule, products);
      const thresholds = sortedThresholds(rule);
      const earnedThresholds = thresholds.filter(
        (threshold) => matchedCount >= threshold.requiredCount,
      );
      const earnedThreshold = earnedThresholds.at(-1) ?? null;
      const nextThreshold =
        thresholds.find((threshold) => matchedCount < threshold.requiredCount) ??
        thresholds.at(-1) ??
        null;
      const threshold = earnedThreshold ?? nextThreshold;
      const requiredCount = threshold?.requiredCount ?? 0;
      const status =
        earnedThreshold !== null ? "earned" : matchedCount > 0 ? "locked" : "no-badge";

      return {
        code: rule.code,
        name: rule.name,
        ruleType: rule.ruleType,
        badgeType: rule.badgeType ?? (rule.ruleType === "tier" ? "product" : "quest"),
        description: rule.description,
        status,
        level: threshold?.level ?? null,
        displayName: threshold?.displayName ?? null,
        matchedCount,
        requiredCount,
        remainingCount: Math.max(requiredCount - matchedCount, 0),
        progress: clampProgress(matchedCount, requiredCount),
        imageUrl:
          status === "earned"
            ? (threshold?.achievedImageUrl ?? null)
            : (threshold?.lockedImageUrl ?? threshold?.achievedImageUrl ?? null),
        matchedProducts,
      };
    });
}
