import { calculateRuleMatch, isRuleActive, isWithinDateWindow } from "@/lib/badge-engine";
import { matchesEligibleSku } from "@/lib/sku";
import type {
  BadgeRuleConfig,
  SonyCustomerProducts,
  SonyOwnedProduct,
} from "@/types/badge";

export type ProductBadgeRegistration = {
  serialNumber: string | null;
  registeredAt: string;
};

export type ProductBadgeExperience = {
  id: string;
  modelCode: string;
  title: string;
  groupCode: string;
  status: "locked" | "unlocked";
  imageUrl: string | null;
  shareImageUrl: string | null;
  productUrl: string | null;
  earnedAt: string | null;
  quantity: number;
  registrations: ProductBadgeRegistration[];
  sortOrder: number;
};

export type QuestTierExperience = {
  id: string;
  level: string | null;
  title: string;
  status: "achieved" | "in-progress" | "locked";
  imageUrl: string | null;
  shareImageUrl: string | null;
  matchedCount: number;
  requiredCount: number;
  remainingCount: number;
  earnedAt: string | null;
  sortOrder: number;
};

export type QuestBadgeExperience = {
  id: string;
  title: string;
  description: string | null;
  tiers: QuestTierExperience[];
  highestEarnedTier: QuestTierExperience | null;
  matchedProducts: SonyOwnedProduct[];
  sortOrder: number;
};

export type BadgeExperience = {
  customer: SonyCustomerProducts["customer"];
  productBadges: ProductBadgeExperience[];
  questBadges: QuestBadgeExperience[];
  recentProductBadges: ProductBadgeExperience[];
  recentQuestBadges: Array<QuestBadgeExperience & { highestEarnedTier: QuestTierExperience }>;
  fetchedAt: string;
};

export function buildBadgeExperience({
  customerProducts,
  rules,
  now = new Date(),
}: {
  customerProducts: SonyCustomerProducts;
  rules: BadgeRuleConfig[];
  now?: Date;
}): BadgeExperience {
  const activeRules = rules.filter((rule) => isRuleActive(rule, now));
  const productBadges = activeRules
    .filter((rule) => rule.badgeType === "product")
    .map((rule) => buildProductBadge(rule, customerProducts.products));
  const questBadges = activeRules
    .filter((rule) => rule.badgeType === "quest")
    .map((rule) => buildQuestBadge(rule, customerProducts.products));

  return {
    customer: customerProducts.customer,
    productBadges,
    questBadges,
    recentProductBadges: productBadges
      .filter((badge) => badge.status === "unlocked" && badge.earnedAt)
      .sort(compareEarnedThenOrder)
      .slice(0, 3),
    recentQuestBadges: questBadges
      .filter(
        (badge): badge is QuestBadgeExperience & { highestEarnedTier: QuestTierExperience } =>
          Boolean(badge.highestEarnedTier?.earnedAt),
      )
      .sort((left, right) =>
        compareEarnedValues(
          left.highestEarnedTier.earnedAt,
          right.highestEarnedTier.earnedAt,
          left.sortOrder,
          right.sortOrder,
        ),
      )
      .slice(0, 3),
    fetchedAt: now.toISOString(),
  };
}

function buildProductBadge(
  rule: BadgeRuleConfig,
  products: SonyOwnedProduct[],
): ProductBadgeExperience {
  const registrations = products
    .filter(
      (product) =>
        matchesEligibleSku(product.sku, rule.skus) &&
        isWithinDateWindow(product.registeredAt, rule.registrationStart, rule.registrationEnd),
    )
    .sort((left, right) => left.registeredAt.localeCompare(right.registeredAt))
    .map((product) => ({
      serialNumber: product.serialNumber,
      registeredAt: product.registeredAt,
    }));
  const threshold = rule.thresholds[0];
  const unlocked = registrations.length > 0;

  return {
    id: rule.code,
    modelCode: rule.productModelCode ?? rule.skus[0] ?? rule.code,
    title: rule.name,
    groupCode: rule.displayGroupCode ?? rule.displayGroup ?? "product",
    status: unlocked ? "unlocked" : "locked",
    imageUrl: unlocked
      ? (threshold?.achievedImageUrl ?? null)
      : (threshold?.lockedImageUrl ?? threshold?.achievedImageUrl ?? null),
    shareImageUrl: threshold?.shareImageUrl ?? threshold?.achievedImageUrl ?? null,
    productUrl: rule.productUrl ?? null,
    earnedAt: registrations[0]?.registeredAt ?? null,
    quantity: registrations.length,
    registrations,
    sortOrder: rule.sortOrder,
  };
}

function buildQuestBadge(
  rule: BadgeRuleConfig,
  products: SonyOwnedProduct[],
): QuestBadgeExperience {
  const { matchedCount, matchedProducts } = calculateRuleMatch(rule, products);
  const thresholds = [...rule.thresholds].sort(
    (left, right) =>
      left.requiredCount - right.requiredCount ||
      (left.sortOrder ?? 0) - (right.sortOrder ?? 0),
  );
  const highestEarnedIndex = thresholds.findLastIndex(
    (threshold) => matchedCount >= threshold.requiredCount,
  );
  const nextIndex = highestEarnedIndex + 1;
  const tiers = thresholds.map((threshold, index) => {
    const achieved = matchedCount >= threshold.requiredCount;
    const status = achieved
      ? "achieved"
      : index === nextIndex && (matchedCount > 0 || highestEarnedIndex >= 0)
        ? "in-progress"
        : "locked";

    return {
      id: `${rule.code}-${threshold.level}`,
      level: rule.ruleType === "tier" ? threshold.level : null,
      title: threshold.displayName,
      status,
      imageUrl: achieved
        ? threshold.achievedImageUrl
        : (threshold.lockedImageUrl ?? threshold.achievedImageUrl),
      shareImageUrl: threshold.shareImageUrl ?? threshold.achievedImageUrl,
      matchedCount: Math.min(matchedCount, threshold.requiredCount),
      requiredCount: threshold.requiredCount,
      remainingCount: Math.max(threshold.requiredCount - matchedCount, 0),
      earnedAt: achieved
        ? findThresholdEarnedAt(rule, products, threshold.requiredCount)
        : null,
      sortOrder: threshold.sortOrder ?? index,
    } satisfies QuestTierExperience;
  });

  return {
    id: rule.code,
    title: rule.name,
    description: rule.description,
    tiers,
    highestEarnedTier: tiers.filter((tier) => tier.status === "achieved").at(-1) ?? null,
    matchedProducts,
    sortOrder: rule.sortOrder,
  };
}

function findThresholdEarnedAt(
  rule: BadgeRuleConfig,
  products: SonyOwnedProduct[],
  requiredCount: number,
): string | null {
  const productsByDate = [...products].sort((left, right) =>
    left.registeredAt.localeCompare(right.registeredAt),
  );

  for (let index = 0; index < productsByDate.length; index += 1) {
    const productsAtDate = productsByDate.slice(0, index + 1);
    const { matchedCount } = calculateRuleMatch(rule, productsAtDate);

    if (matchedCount >= requiredCount) {
      return productsByDate[index]?.registeredAt ?? null;
    }
  }

  return null;
}

function compareEarnedThenOrder(
  left: ProductBadgeExperience,
  right: ProductBadgeExperience,
): number {
  return compareEarnedValues(left.earnedAt, right.earnedAt, left.sortOrder, right.sortOrder);
}

function compareEarnedValues(
  left: string | null,
  right: string | null,
  leftOrder: number,
  rightOrder: number,
): number {
  return (right ?? "").localeCompare(left ?? "") || leftOrder - rightOrder;
}
