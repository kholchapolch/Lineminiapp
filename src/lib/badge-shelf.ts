import { normalizeSku } from "@/lib/sony-products";
import type { BadgeRuleConfig, BadgeShelfItem, SonyOwnedProduct } from "@/types/badge";

type BuildBadgeShelfInput = {
  products: SonyOwnedProduct[];
  rules: BadgeRuleConfig[];
  now?: Date;
};

function toDate(value: string | null): Date | null {
  return value ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`) : null;
}

function isRuleActive(rule: BadgeRuleConfig, now: Date): boolean {
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

function isWithinDateWindow(value: string, start: string | null, end: string | null): boolean {
  const registeredAt = toDate(value);
  const startsAt = toDate(start);
  const endsAt = toDate(end);

  if (!registeredAt) {
    return false;
  }

  if (startsAt && registeredAt < startsAt) {
    return false;
  }

  if (endsAt && registeredAt > endsAt) {
    return false;
  }

  return true;
}

function countMatchedProducts(rule: BadgeRuleConfig, products: SonyOwnedProduct[]): number {
  const eligibleSkus = new Set(rule.skus.map(normalizeSku));
  const matchedSkus = new Set<string>();

  for (const product of products) {
    const normalizedSku = normalizeSku(product.sku);

    if (
      eligibleSkus.has(normalizedSku) &&
      isWithinDateWindow(product.registeredAt, rule.registrationStart, rule.registrationEnd)
    ) {
      matchedSkus.add(normalizedSku);
    }
  }

  return matchedSkus.size;
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
      const matchedCount = countMatchedProducts(rule, products);

      return [...rule.thresholds]
        .sort((left, right) => left.requiredCount - right.requiredCount)
        .map((threshold) => {
          const achieved = matchedCount >= threshold.requiredCount;
          const label = threshold.displayName;

          return {
            code: `${rule.code}-${threshold.level}`,
            label,
            title: `${rule.name} ${label}`,
            description: rule.description ?? `Unlock ${rule.name} ${label}.`,
            imageUrl: achieved ? threshold.imageUrl : threshold.lockedImageUrl,
            status: achieved ? "achieved" : "available",
            visualState: achieved ? "color" : "dimmed",
          } satisfies BadgeShelfItem;
        });
    });
}
