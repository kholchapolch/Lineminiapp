import { describe, expect, it } from "vitest";
import { buildBadgeShelf } from "@/lib/badge-shelf";
import type { BadgeRuleConfig, SonyOwnedProduct } from "@/types/badge";

const products: SonyOwnedProduct[] = [
  { sku: "ILCE-7M4", modelName: "Alpha 7 IV", serialNumber: "SN1", registeredAt: "2026-05-20" },
  { sku: "SEL35F14GM", modelName: "FE 35mm F1.4 GM", serialNumber: "SN2", registeredAt: "2026-05-21" },
];

const rules: BadgeRuleConfig[] = [
  {
    id: 1,
    code: "alpha-tier",
    name: "Alpha Collector",
    ruleType: "tier",
    description: "Collect eligible Sony Alpha camera and G Master lens products.",
    sortOrder: 10,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
    thresholds: [
      { level: "bronze", displayName: "Bronze", requiredCount: 1, imageUrl: "bronze.png", lockedImageUrl: "locked.png" },
      { level: "silver", displayName: "Silver", requiredCount: 2, imageUrl: "silver.png", lockedImageUrl: "locked.png" },
      { level: "gold", displayName: "Gold", requiredCount: 3, imageUrl: "gold.png", lockedImageUrl: "locked.png" },
    ],
  },
  {
    id: 2,
    code: "pro-achievement",
    name: "Pro Achievement",
    ruleType: "achievement",
    description: "Own three eligible Sony products during the campaign.",
    sortOrder: 20,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
    thresholds: [
      { level: "achievement", displayName: "Achievement", requiredCount: 3, imageUrl: "achievement.png", lockedImageUrl: "locked.png" },
    ],
  },
  ...Array.from({ length: 5 }, (_, index): BadgeRuleConfig => ({
    id: index + 3,
    code: `future-${index + 1}`,
    name: `Future Badge ${index + 1}`,
    ruleType: "achievement",
    description: `Future badge ${index + 1}`,
    sortOrder: 30 + index,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: [`FUTURE-${index + 1}`],
    thresholds: [
      {
        level: "achievement",
        displayName: `Future ${index + 1}`,
        requiredCount: 1,
        imageUrl: `future-${index + 1}.png`,
        lockedImageUrl: "locked.png",
      },
    ],
  })),
];

describe("buildBadgeShelf", () => {
  it("expands active badge rules and thresholds into nine shelf badges", () => {
    const shelf = buildBadgeShelf({ products, rules, now: new Date("2026-06-01") });

    expect(shelf).toHaveLength(9);
    expect(shelf.map((item) => item.code)).toEqual([
      "alpha-tier-bronze",
      "alpha-tier-silver",
      "alpha-tier-gold",
      "pro-achievement-achievement",
      "future-1-achievement",
      "future-2-achievement",
      "future-3-achievement",
      "future-4-achievement",
      "future-5-achievement",
    ]);
  });

  it("uses Sony products to mark achieved and available shelf badges", () => {
    const shelf = buildBadgeShelf({ products, rules, now: new Date("2026-06-01") });

    expect(shelf.slice(0, 4)).toMatchObject([
      { label: "Bronze", status: "achieved", visualState: "color", imageUrl: "bronze.png" },
      { label: "Silver", status: "achieved", visualState: "color", imageUrl: "silver.png" },
      { label: "Gold", status: "available", visualState: "dimmed", imageUrl: "locked.png" },
      { label: "Achievement", status: "available", visualState: "dimmed", imageUrl: "locked.png" },
    ]);
  });

  it("does not require Sony to provide badgeShelf JSON", () => {
    const shelf = buildBadgeShelf({ products: [], rules, now: new Date("2026-06-01") });

    expect(shelf).toHaveLength(9);
    expect(shelf.every((item) => item.visualState === "dimmed")).toBe(true);
  });
});
