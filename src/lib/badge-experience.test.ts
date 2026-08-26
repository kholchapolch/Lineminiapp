import { describe, expect, it } from "vitest";
import { buildBadgeExperience } from "@/lib/badge-experience";
import type { BadgeRuleConfig, SonyCustomerProducts } from "@/types/badge";

const customerProducts: SonyCustomerProducts = {
  customer: {
    lineuuid: "line-1",
    customerId: "customer-1",
    displayName: "Customer",
    lineDisplayName: "Line Customer",
    linePictureUrl: null,
  },
  products: [
    { sku: "LENS-A", modelName: "Lens A", serialNumber: "A-1", registeredAt: "2026-01-01" },
    { sku: "lens-a", modelName: "Lens A", serialNumber: "A-2", registeredAt: "2026-01-03" },
    { sku: "LENS-B", modelName: "Lens B", serialNumber: "B-1", registeredAt: "2026-01-02" },
    { sku: "LENS-C", modelName: "Lens C", serialNumber: "C-1", registeredAt: "2026-01-04" },
  ],
};

const rules: BadgeRuleConfig[] = [
  {
    id: 1,
    code: "product-lens-a",
    name: "Lens A",
    badgeType: "product",
    ruleType: "achievement",
    displayCategory: "Product Badge",
    displayGroup: "prime-lens",
    displayGroupCode: "prime-lens",
    productModelCode: "LENS-A",
    productUrl: null,
    description: null,
    sortOrder: 1,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: ["LENS-A"],
    thresholds: [{
      level: "achievement",
      displayName: "Lens A",
      requiredCount: 1,
      achievedImageUrl: "earned.png",
      lockedImageUrl: null,
      shareImageUrl: "share.png",
    }],
    conditions: [{ id: 1, label: "Own A", matchType: "any", requiredCount: 1, sonySkus: ["LENS-A"] }],
  },
  {
    id: 2,
    code: "portrait-master",
    name: "Portrait Master",
    badgeType: "quest",
    ruleType: "tier",
    displayCategory: "Quest Badge",
    displayGroup: "quest",
    description: null,
    sortOrder: 2,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: ["LENS-A", "LENS-B", "LENS-C"],
    thresholds: [
      { level: "bronze", displayName: "Bronze", requiredCount: 2, achievedImageUrl: "bronze.png", lockedImageUrl: null },
      { level: "silver", displayName: "Silver", requiredCount: 3, achievedImageUrl: "silver.png", lockedImageUrl: null },
      { level: "gold", displayName: "Gold", requiredCount: 4, achievedImageUrl: "gold.png", lockedImageUrl: null },
    ],
    conditions: [{ id: 2, label: "Collect", matchType: "min_count", requiredCount: 4, sonySkus: ["LENS-A", "LENS-B", "LENS-C", "LENS-D"] }],
  },
];

describe("buildBadgeExperience", () => {
  it("creates one product badge with all serial registrations", () => {
    const result = buildBadgeExperience({ customerProducts, rules });
    const badge = result.productBadges[0];

    expect(badge).toMatchObject({
      status: "unlocked",
      earnedAt: "2026-01-01",
      quantity: 2,
    });
    expect(badge?.registrations.map((registration) => registration.serialNumber)).toEqual([
      "A-1",
      "A-2",
    ]);
  });

  it("deduplicates models for quest tiers and derives threshold dates", () => {
    const result = buildBadgeExperience({ customerProducts, rules });
    const quest = result.questBadges[0];

    expect(quest?.tiers).toMatchObject([
      { level: "bronze", status: "achieved", matchedCount: 2, earnedAt: "2026-01-02" },
      { level: "silver", status: "achieved", matchedCount: 3, earnedAt: "2026-01-04" },
      { level: "gold", status: "in-progress", matchedCount: 3, earnedAt: null },
    ]);
    expect(quest?.highestEarnedTier?.level).toBe("silver");
    expect(quest?.eligibleSkus).toEqual(["LENS-A", "LENS-B", "LENS-C", "LENS-D"]);
  });

  it("orders same-day recent product badges alphabetically by title", () => {
    const sameDayProducts: SonyCustomerProducts = {
      ...customerProducts,
      products: [
        { sku: "LENS-B", modelName: "Lens B", serialNumber: "B-1", registeredAt: "2026-01-01" },
        { sku: "LENS-A", modelName: "Lens A", serialNumber: "A-1", registeredAt: "2026-01-01" },
      ],
    };
    const sameDayRules: BadgeRuleConfig[] = [
      {
        ...rules[0],
        id: 10,
        code: "product-lens-b",
        name: "Zebra Lens",
        productModelCode: "LENS-B",
        skus: ["LENS-B"],
        sortOrder: 1,
        conditions: [
          { id: 10, label: "Own B", matchType: "any", requiredCount: 1, sonySkus: ["LENS-B"] },
        ],
      },
      {
        ...rules[0],
        id: 11,
        code: "product-lens-a2",
        name: "Alpha Lens",
        productModelCode: "LENS-A",
        skus: ["LENS-A"],
        sortOrder: 99,
        conditions: [
          { id: 11, label: "Own A", matchType: "any", requiredCount: 1, sonySkus: ["LENS-A"] },
        ],
      },
    ];

    const result = buildBadgeExperience({
      customerProducts: sameDayProducts,
      rules: sameDayRules,
    });

    expect(result.recentProductBadges.map((badge) => badge.title)).toEqual([
      "Alpha Lens",
      "Zebra Lens",
    ]);
  });
});
