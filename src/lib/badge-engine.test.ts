import { describe, expect, it } from "vitest";
import { calculateBadges } from "@/lib/badge-engine";
import type { BadgeRuleConfig, SonyOwnedProduct } from "@/types/badge";

const products: SonyOwnedProduct[] = [
  { sku: "ILCE-7M4", modelName: "Alpha 7 IV", serialNumber: "SN1", registeredAt: "2026-05-20" },
  { sku: "SEL35F14GM", modelName: "FE 35mm F1.4 GM", serialNumber: "SN2", registeredAt: "2026-05-21" },
  { sku: " sel2470gm2 ", modelName: "FE 24-70mm F2.8 GM II", serialNumber: "SN3", registeredAt: "2026-05-22" },
  { sku: "ILCE-7M4", modelName: "Duplicate Alpha", serialNumber: "SN4", registeredAt: "2026-05-23" },
];

const rules: BadgeRuleConfig[] = [
  {
    id: 1,
    code: "alpha-tier",
    name: "Alpha Collector",
    ruleType: "tier",
    description: "Collect eligible Alpha gear.",
    sortOrder: 10,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
    thresholds: [
      { level: "bronze", requiredCount: 1, imageUrl: "bronze.png", lockedImageUrl: "locked.png", displayName: "Bronze" },
      { level: "silver", requiredCount: 2, imageUrl: "silver.png", lockedImageUrl: "locked.png", displayName: "Silver" },
      { level: "gold", requiredCount: 3, imageUrl: "gold.png", lockedImageUrl: "locked.png", displayName: "Gold" },
    ],
  },
  {
    id: 2,
    code: "pro-achievement",
    name: "Pro Achievement",
    ruleType: "achievement",
    description: "Own three eligible products.",
    sortOrder: 20,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
    thresholds: [
      { level: "achievement", requiredCount: 3, imageUrl: "achievement.png", lockedImageUrl: "locked.png", displayName: "Achievement" },
    ],
  },
];

describe("calculateBadges", () => {
  it("dedupes owned SKUs and awards the highest eligible tier", () => {
    const result = calculateBadges({ products, rules, now: new Date("2026-06-01") });

    expect(result[0]).toMatchObject({
      code: "alpha-tier",
      status: "earned",
      level: "gold",
      matchedCount: 3,
      requiredCount: 3,
      imageUrl: "gold.png",
    });
  });

  it("awards achievement when the achievement threshold is reached", () => {
    const result = calculateBadges({ products, rules, now: new Date("2026-06-01") });

    expect(result[1]).toMatchObject({
      code: "pro-achievement",
      status: "earned",
      level: "achievement",
      matchedCount: 3,
    });
  });

  it("applies registration date windows before threshold calculation", () => {
    const [result] = calculateBadges({
      products,
      now: new Date("2026-06-01"),
      rules: [{ ...rules[0], registrationStart: "2026-05-22", registrationEnd: "2026-05-22" }],
    });

    expect(result).toMatchObject({
      status: "earned",
      level: "bronze",
      matchedCount: 1,
      requiredCount: 1,
    });
  });
});
