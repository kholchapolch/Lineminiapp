import { describe, expect, it } from "vitest";
import { buildDebugTrace } from "@/lib/debug-trace";
import type { BadgeDisplayItem, BadgeRuleConfig, BadgeShelfItem, SonyCustomerProducts } from "@/types/badge";

const customerProducts: SonyCustomerProducts = {
  customer: {
    lineuuid: "line-user-123",
    customerId: "customer-001",
    displayName: "Nicha Wong",
    lineDisplayName: "Nicha",
    linePictureUrl: "https://example.com/profile.png",
  },
  products: [
    {
      sku: "ILCE-7M4",
      modelName: "Alpha 7 IV",
      serialNumber: "SN-A7M4-001",
      registeredAt: "2026-05-20",
    },
  ],
};

const rules: BadgeRuleConfig[] = [
  {
    id: 1,
    code: "alpha-tier",
    name: "Alpha Collector",
    ruleType: "tier",
    description: "Collect eligible Sony Alpha camera and G Master lens products.",
    sortOrder: 10,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["SEL35F14GM", "ILCE-7M4"],
    thresholds: [
      {
        level: "silver",
        displayName: "Silver",
        requiredCount: 2,
        achievedImageUrl: "silver.png",
        lockedImageUrl: "locked.png",
        sortOrder: 20,
      },
      {
        level: "bronze",
        displayName: "Bronze",
        requiredCount: 1,
        achievedImageUrl: "bronze.png",
        lockedImageUrl: "locked.png",
        sortOrder: 10,
      },
    ],
    conditions: [
      {
        id: 10,
        label: "Own any key FF model",
        matchType: "any",
        requiredCount: 1,
        sonySkus: ["ILCE-7M4", "ILCE-9M3"],
      },
    ],
  },
];

const badges: BadgeDisplayItem[] = [
  {
    code: "alpha-tier",
    name: "Alpha Collector - Bronze",
    type: "product",
    description: "Collect eligible Sony Alpha camera and G Master lens products.",
    status: "earned",
    progress: 100,
    remainingCount: 0,
    matchedCount: 1,
    requiredCount: 1,
    imageUrl: "bronze.png",
    serialNumber: "SN-A7M4-001",
    modelName: "Alpha 7 IV",
    registrationDate: "2026-05-20",
    level: "bronze",
  },
];

const badgeShelf: BadgeShelfItem[] = [
  {
    code: "alpha-tier-bronze",
    ruleCode: "alpha-tier",
    level: "bronze",
    label: "Bronze",
    title: "Alpha Collector Bronze",
    description: "Collect eligible Sony Alpha camera and G Master lens products.",
    ruleConditionText: "Own any key FF model: own any 1 of 2",
    imageUrl: "bronze.png",
    status: "achieved",
    visualState: "color",
    matchedCount: 1,
    requiredCount: 1,
    progress: 100,
  },
];

describe("buildDebugTrace", () => {
  it("separates DB rules, Sony API mock input, and aggregation result", () => {
    const trace = buildDebugTrace({
      customerProducts,
      rules,
      badges,
      badgeShelf,
      dbSchema: [
        {
          tableName: "badge_rules",
          columnName: "badge_code",
          dataType: "text",
          isNullable: false,
          columnDefault: null,
          ordinalPosition: 2,
        },
      ],
      dbTables: [
        {
          tableName: "badge_rules",
          rows: [{ id: 1, badge_code: "alpha-tier", is_active: true }],
        },
      ],
    });

    expect(trace.dbRules.schema).toEqual([
      {
        tableName: "badge_rules",
        columnName: "badge_code",
        dataType: "text",
        isNullable: false,
        columnDefault: null,
        ordinalPosition: 2,
      },
    ]);
    expect(trace.dbRules.tables).toEqual([
      {
        tableName: "badge_rules",
        rows: [{ id: 1, badge_code: "alpha-tier", is_active: true }],
      },
    ]);
    expect(trace.dbRules.badgeShelfSetup).toMatchObject([
      {
        badgeCode: "alpha-tier",
        badgeName: "Alpha Collector",
        level: "bronze",
        displayName: "Bronze",
        status: "achieved",
        progress: 100,
        matchedCount: 1,
        requiredCount: 1,
        skuAmount: 2,
      },
      {
        badgeCode: "alpha-tier",
        badgeName: "Alpha Collector",
        level: "silver",
        displayName: "Silver",
        requiredCount: 2,
        skuAmount: 2,
      },
    ]);
    expect("rules" in trace.dbRules).toBe(false);
    expect(trace.sonyApiMock.products).toEqual([
      {
        sku: "ILCE-7M4",
        skuLabel: "ILCE-7M4",
        modelNamePresent: true,
        serialNumberPresent: true,
        registeredAtPresent: true,
      },
    ]);
    expect(trace.aggregationResult.badgeShelf).toEqual(badgeShelf);
  });

  it("redacts customer and product sensitive values from Sony mock debug output", () => {
    const trace = buildDebugTrace({ customerProducts, rules, badges, badgeShelf });
    const serialized = JSON.stringify(trace);

    expect(trace.sonyApiMock.customer).toEqual({
      customerIdPresent: true,
      displayNamePresent: true,
      lineDisplayNamePresent: true,
      lineuuidPresent: true,
      linePictureUrlPresent: true,
    });
    expect(serialized).not.toContain("line-user-123");
    expect(serialized).not.toContain("customer-001");
    expect(serialized).not.toContain("Nicha");
    expect(serialized).not.toContain("profile.png");
    expect(serialized).not.toContain("SN-A7M4-001");
    expect(serialized).not.toContain("Alpha 7 IV");
    expect(serialized).not.toContain("2026-05-20");
  });

  it("summarizes aggregation counts and redacts detailed sensitive badge fields", () => {
    const trace = buildDebugTrace({ customerProducts, rules, badges, badgeShelf });

    expect(trace.aggregationResult.summary).toEqual({
      sourceProductCount: 1,
      badgeShelfCount: 1,
      detailedBadgeCount: 1,
      achievedShelfCount: 1,
    });
    expect(trace.aggregationResult.ruleMatches).toEqual([
      {
        code: "alpha-tier",
        name: "Alpha Collector - Bronze",
        status: "earned",
        matchedCount: 1,
        requiredCount: 1,
        remainingCount: 0,
        progress: 100,
        level: "bronze",
        serialNumberPresent: true,
        modelNamePresent: true,
        registrationDatePresent: true,
      },
    ]);
  });
});
