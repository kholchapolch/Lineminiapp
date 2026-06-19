import { describe, expect, it } from "vitest";
import {
  isDebugModeEnabled,
  isDebugTraceEnabled,
  toDebugJsonPayload,
} from "@/lib/debug-mode";
import type { BadgeResultPayload } from "@/types/badge";

const payload: BadgeResultPayload = {
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
  supportMessage: "Support message",
  badgeShelf: [
    {
      code: "alpha-bronze",
      ruleCode: "alpha",
      level: "bronze",
      label: "Bronze",
      title: "Alpha Collector Bronze",
      description: "Register one eligible Sony Alpha product.",
      ruleConditionText: "Own Alpha gear: own 1 of 3",
      imageUrl: "https://example.com/bronze.png",
      status: "achieved",
      visualState: "color",
      matchedCount: 1,
      requiredCount: 1,
      progress: 100,
    },
  ],
  badges: [
    {
      code: "alpha-owner",
      name: "Alpha Owner",
      type: "product",
      description: "Own a supported Sony Alpha camera.",
      status: "earned",
      progress: 100,
      remainingCount: 0,
      matchedCount: 1,
      requiredCount: 1,
      imageUrl: "https://example.com/badge.png",
      serialNumber: "SN-A7M4-001",
      modelName: "Alpha 7 IV",
      registrationDate: "2026-05-20",
    },
  ],
};

describe("isDebugModeEnabled", () => {
  it("enables debug mode in local from query parameter", () => {
    expect(
      isDebugModeEnabled({ appEnv: "local", debugParam: "1", envFlag: undefined }),
    ).toBe(true);
  });

  it("stays disabled by default", () => {
    expect(
      isDebugModeEnabled({ appEnv: "local", debugParam: undefined, envFlag: undefined }),
    ).toBe(false);
  });

  it("blocks debug mode in production even when requested", () => {
    expect(
      isDebugModeEnabled({ appEnv: "production", debugParam: "1", envFlag: "true" }),
    ).toBe(false);
  });
});

describe("isDebugTraceEnabled", () => {
  it("enables trace only from explicit debug query outside production", () => {
    expect(isDebugTraceEnabled({ appEnv: "local", debugParam: "1" })).toBe(true);
    expect(isDebugTraceEnabled({ appEnv: "staging", debugParam: "1" })).toBe(true);
  });

  it("does not use legacy env flag behavior", () => {
    expect(isDebugTraceEnabled({ appEnv: "local", debugParam: undefined })).toBe(false);
  });

  it("does not accept truthy aliases for trace", () => {
    expect(isDebugTraceEnabled({ appEnv: "local", debugParam: "true" })).toBe(false);
    expect(isDebugTraceEnabled({ appEnv: "local", debugParam: "yes" })).toBe(false);
  });

  it("blocks trace in production even when requested", () => {
    expect(isDebugTraceEnabled({ appEnv: "production", debugParam: "1" })).toBe(false);
  });
});

describe("toDebugJsonPayload", () => {
  it("returns display-safe customer, product, and badge data", () => {
    expect(toDebugJsonPayload(payload)).toEqual({
      customer: {
        customerIdPresent: true,
        displayNamePresent: true,
        lineDisplayNamePresent: true,
        lineuuidPresent: true,
        linePictureUrlPresent: true,
      },
      products: [
        {
          sku: "ILCE-7M4",
          modelNamePresent: true,
          registeredAtPresent: true,
          serialNumberPresent: true,
        },
      ],
      badges: [
        {
          code: "alpha-owner",
          type: "product",
          status: "earned",
          progress: 100,
          matchedCount: 1,
          requiredCount: 1,
          remainingCount: 0,
          level: null,
          imageUrl: "https://example.com/badge.png",
        },
      ],
      badgeShelf: [
        {
          code: "alpha-bronze",
          ruleCode: "alpha",
          level: "bronze",
          label: "Bronze",
          title: "Alpha Collector Bronze",
          ruleConditionText: "Own Alpha gear: own 1 of 3",
          status: "achieved",
          visualState: "color",
          matchedCount: 1,
          requiredCount: 1,
          progress: 100,
          imageUrl: "https://example.com/bronze.png",
        },
      ],
      supportMessage: "Support message",
    });
  });

  it("does not expose raw customer or product sensitive values", () => {
    const debugPayload = JSON.stringify(toDebugJsonPayload(payload));

    expect(debugPayload).not.toContain("line-user-123");
    expect(debugPayload).not.toContain("customer-001");
    expect(debugPayload).not.toContain("Nicha");
    expect(debugPayload).not.toContain("profile.png");
    expect(debugPayload).not.toContain("SN-A7M4-001");
    expect(debugPayload).not.toContain("Alpha 7 IV");
    expect(debugPayload).not.toContain("2026-05-20");
  });
});
