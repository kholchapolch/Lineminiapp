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
      { level: "bronze", requiredCount: 1, achievedImageUrl: "bronze.png", lockedImageUrl: "locked.png", displayName: "Bronze" },
      { level: "silver", requiredCount: 2, achievedImageUrl: "silver.png", lockedImageUrl: "locked.png", displayName: "Silver" },
      { level: "gold", requiredCount: 3, achievedImageUrl: "gold.png", lockedImageUrl: "locked.png", displayName: "Gold" },
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
      { level: "achievement", requiredCount: 3, achievedImageUrl: "achievement.png", lockedImageUrl: "locked.png", displayName: "Achievement" },
    ],
  },
];

function questRule(
  code: string,
  conditions: NonNullable<BadgeRuleConfig["conditions"]>,
  requiredCount: number,
): BadgeRuleConfig {
  return {
    id: 100,
    code,
    name: code,
    ruleType: "achievement",
    badgeType: "quest",
    description: null,
    sortOrder: 100,
    isActive: true,
    activeFrom: null,
    activeTo: null,
    registrationStart: null,
    registrationEnd: null,
    skus: [],
    thresholds: [
      {
        level: "achievement",
        requiredCount,
        achievedImageUrl: `${code}.png`,
        lockedImageUrl: "locked.png",
        displayName: code,
      },
    ],
    conditions,
  };
}

function product(sku: string): SonyOwnedProduct {
  return {
    sku,
    modelName: sku,
    serialNumber: `SN-${sku}`,
    registeredAt: "2026-05-20",
  };
}

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

  it("falls back to the achieved image when locked image URL is not configured", () => {
    const [result] = calculateBadges({
      products: [],
      now: new Date("2026-06-01"),
      rules: [
        {
          ...rules[0],
          thresholds: [
            {
              level: "bronze",
              requiredCount: 1,
              achievedImageUrl: "bronze.png",
              lockedImageUrl: null,
              displayName: "Bronze",
            },
          ],
        },
      ],
    });

    expect(result).toMatchObject({
      status: "no-badge",
      imageUrl: "bronze.png",
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

  it("keeps a badge earned after the earning period when product registration qualified", () => {
    const [result] = calculateBadges({
      products,
      now: new Date("2026-08-01"),
      rules: [
        {
          ...rules[0],
          activeTo: null,
          registrationStart: "2026-05-01",
          registrationEnd: "2026-06-30",
        },
      ],
    });

    expect(result).toMatchObject({
      status: "earned",
      level: "gold",
      matchedCount: 3,
      requiredCount: 3,
    });
  });

  it("does not award a limited-period badge from products registered after the earning period", () => {
    const [result] = calculateBadges({
      products: [
        {
          sku: "ILCE-7M4",
          modelName: "Alpha 7 IV",
          serialNumber: "SN5",
          registeredAt: "2026-07-01",
        },
      ],
      now: new Date("2026-08-01"),
      rules: [
        {
          ...rules[0],
          activeTo: null,
          registrationStart: "2026-05-01",
          registrationEnd: "2026-06-30",
        },
      ],
    });

    expect(result).toMatchObject({
      status: "no-badge",
      matchedCount: 0,
      requiredCount: 1,
    });
  });

  it("hides the badge only when the display active window has expired", () => {
    const result = calculateBadges({
      products,
      now: new Date("2026-08-01"),
      rules: [
        {
          ...rules[0],
          activeTo: "2026-06-30",
          registrationStart: "2026-05-01",
          registrationEnd: "2026-06-30",
        },
      ],
    });

    expect(result).toEqual([]);
  });

  it("supports all and min_count conditions", () => {
    const result = calculateBadges({
      products,
      now: new Date("2026-06-01"),
      rules: [
        {
          id: 3,
          code: "all-required-demo",
          name: "All Required Demo",
          ruleType: "achievement",
          badgeType: "quest",
          description: "Own the GM trinity lens set.",
          sortOrder: 30,
          isActive: true,
          activeFrom: null,
          activeTo: null,
          registrationStart: null,
          registrationEnd: null,
          skus: [],
          thresholds: [
            { level: "achievement", requiredCount: 3, achievedImageUrl: "gm.png", lockedImageUrl: "locked.png", displayName: "GM" },
          ],
          conditions: [
            {
              id: 1,
              label: "Own GM trinity set",
              matchType: "all",
              requiredCount: 3,
              sonySkus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
            },
          ],
        },
        {
          id: 4,
          code: "min-count-demo",
          name: "Min Count Demo",
          ruleType: "achievement",
          badgeType: "quest",
          description: "Own two supported lenses.",
          sortOrder: 40,
          isActive: true,
          activeFrom: null,
          activeTo: null,
          registrationStart: null,
          registrationEnd: null,
          skus: [],
          thresholds: [
            { level: "achievement", requiredCount: 2, achievedImageUrl: "premium.png", lockedImageUrl: "locked.png", displayName: "Premium" },
          ],
          conditions: [
            {
              id: 2,
              label: "Own any two lenses",
              matchType: "min_count",
              requiredCount: 2,
              sonySkus: ["SEL35F14GM", "SEL2470GM2", "SEL70200GM2"],
            },
          ],
        },
      ],
    });

    expect(result).toMatchObject([
      { code: "all-required-demo", status: "earned", matchedCount: 3 },
      { code: "min-count-demo", status: "earned", matchedCount: 2 },
    ]);
  });

  it("supports mixed any plus all conditions", () => {
    const [result] = calculateBadges({
      products,
      now: new Date("2026-06-01"),
      rules: [
        {
          id: 5,
          code: "mixed-condition-demo",
          name: "Mixed Condition Demo",
          ruleType: "achievement",
          badgeType: "quest",
          description: "Own one wide lens and a travel set.",
          sortOrder: 50,
          isActive: true,
          activeFrom: null,
          activeTo: null,
          registrationStart: null,
          registrationEnd: null,
          skus: [],
          thresholds: [
            { level: "achievement", requiredCount: 3, achievedImageUrl: "travel.png", lockedImageUrl: "locked.png", displayName: "Travel" },
          ],
          conditions: [
            {
              id: 3,
              label: "Own one wide lens",
              matchType: "any",
              requiredCount: 1,
              sonySkus: ["ILCE-7M4", "SEL20F18G"],
            },
            {
              id: 4,
              label: "Own travel set",
              matchType: "all",
              requiredCount: 2,
              sonySkus: ["SEL35F14GM", "SEL2470GM2"],
            },
          ],
        },
      ],
    });

    expect(result).toMatchObject({
      code: "mixed-condition-demo",
      status: "earned",
      matchedCount: 3,
      requiredCount: 3,
    });
  });

  it("supports client Excel any-1 quest badges with case-insensitive SKU matching", () => {
    const [result] = calculateBadges({
      products: [product(" sel85f14gm2 ")],
      now: new Date("2026-06-01"),
      rules: [
        questRule(
          "portrait-master",
          [
            {
              id: 1,
              label: "Own any one Portrait Master lens",
              matchType: "any",
              requiredCount: 1,
              sonySkus: ["SEL35F14GM", "SEL50F14GM", "SEL85F14GM2"],
            },
          ],
          1,
        ),
      ],
    });

    expect(result).toMatchObject({
      code: "portrait-master",
      status: "earned",
      matchedCount: 1,
      requiredCount: 1,
    });
  });

  it("supports Trinity Master grouped version alternatives", () => {
    const rule = questRule(
      "trinity-master",
      [
        {
          id: 1,
          label: "Own one 16-35 GM family lens",
          matchType: "any",
          requiredCount: 1,
          sonySkus: ["SEL1635GM", "SEL1635GM2"],
        },
        {
          id: 2,
          label: "Own one 24-70 GM family lens",
          matchType: "any",
          requiredCount: 1,
          sonySkus: ["SEL2470GM", "SEL2470GM2"],
        },
        {
          id: 3,
          label: "Own one 70-200 GM family lens",
          matchType: "any",
          requiredCount: 1,
          sonySkus: ["SEL70200GM", "SEL70200GM2"],
        },
      ],
      3,
    );

    const [earned] = calculateBadges({
      products: [product("SEL1635GM"), product("SEL2470GM2"), product("SEL70200GM")],
      now: new Date("2026-06-01"),
      rules: [rule],
    });
    const [missingFamily] = calculateBadges({
      products: [product("SEL1635GM"), product("SEL2470GM2")],
      now: new Date("2026-06-01"),
      rules: [rule],
    });

    expect(earned).toMatchObject({ status: "earned", matchedCount: 3, requiredCount: 3 });
    expect(missingFamily).toMatchObject({ status: "locked", matchedCount: 2, requiredCount: 3 });
  });

  it("counts only one product for Trinity Master any-family when both versions are owned", () => {
    const rule = questRule(
      "trinity-master",
      [
        {
          id: 1,
          label: "Own one 16-35 GM family lens",
          matchType: "any",
          requiredCount: 1,
          sonySkus: ["SEL1635GM", "SEL1635GM2"],
        },
        {
          id: 2,
          label: "Own one 24-70 GM family lens",
          matchType: "any",
          requiredCount: 1,
          sonySkus: ["SEL2470GM", "SEL2470GM2"],
        },
        {
          id: 3,
          label: "Own one 70-200 GM family lens",
          matchType: "any",
          requiredCount: 1,
          sonySkus: ["SEL70200GM", "SEL70200GM2"],
        },
      ],
      3,
    );

    const [result] = calculateBadges({
      products: [
        product("SEL1635GM"),
        { ...product("SEL1635GM2"), registeredAt: "2026-05-21" },
      ],
      now: new Date("2026-06-01"),
      rules: [rule],
    });

    expect(result).toMatchObject({
      status: "locked",
      matchedCount: 1,
      requiredCount: 3,
    });
    expect(result.matchedProducts).toHaveLength(1);
    expect(result.matchedProducts[0]?.sku).toBe("SEL1635GM");
  });

  it("supports All Rounder as any three of four listed SKUs", () => {
    const rule = questRule(
      "all-rounder",
      [
        {
          id: 1,
          label: "Own any three All Rounder lenses",
          matchType: "min_count",
          requiredCount: 3,
          sonySkus: ["SEL2070G", "SELP1635G", "SEL1635Z", "SEL70200G"],
        },
      ],
      3,
    );

    const [earned] = calculateBadges({
      products: [product("SEL2070G"), product("SELP1635G"), product("SEL70200G")],
      now: new Date("2026-06-01"),
      rules: [rule],
    });
    const [locked] = calculateBadges({
      products: [product("SEL2070G"), product("SELP1635G")],
      now: new Date("2026-06-01"),
      rules: [rule],
    });

    expect(earned).toMatchObject({ status: "earned", matchedCount: 3, requiredCount: 3 });
    expect(locked).toMatchObject({ status: "locked", matchedCount: 2, requiredCount: 3 });
  });

  it("supports client Excel all-required quest badges", () => {
    const rule = questRule(
      "f2-master",
      [
        {
          id: 1,
          label: "Own both F2 Master lenses",
          matchType: "all",
          requiredCount: 2,
          sonySkus: ["SEL2870GM", "SEL50150GM"],
        },
      ],
      2,
    );

    const [earned] = calculateBadges({
      products: [product("SEL2870GM"), product("SEL50150GM")],
      now: new Date("2026-06-01"),
      rules: [rule],
    });
    const [locked] = calculateBadges({
      products: [product("SEL2870GM")],
      now: new Date("2026-06-01"),
      rules: [rule],
    });

    expect(earned).toMatchObject({ status: "earned", matchedCount: 2, requiredCount: 2 });
    expect(locked).toMatchObject({ status: "locked", matchedCount: 1, requiredCount: 2 });
  });
});
