import { describe, expect, it } from "vitest";
import { isDebugModeEnabled, toDebugJsonPayload } from "@/lib/debug-mode";
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

describe("toDebugJsonPayload", () => {
  it("returns display-safe customer, product, and badge data", () => {
    expect(toDebugJsonPayload(payload)).toEqual({
      customer: {
        customerId: "customer-001",
        displayName: "Nicha Wong",
        lineDisplayName: "Nicha",
        lineuuidPresent: true,
      },
      products: [
        {
          sku: "ILCE-7M4",
          modelName: "Alpha 7 IV",
          registeredAt: "2026-05-20",
          serialNumber: "SN-A7M4-001",
        },
      ],
      badges: [
        {
          code: "alpha-owner",
          name: "Alpha Owner",
          type: "product",
          status: "earned",
          progress: 100,
          matchedCount: 1,
          requiredCount: 1,
          remainingCount: 0,
          imageUrl: "https://example.com/badge.png",
        },
      ],
      supportMessage: "Support message",
    });
  });

  it("does not expose raw LINE identifiers or profile image URLs", () => {
    const debugPayload = JSON.stringify(toDebugJsonPayload(payload));

    expect(debugPayload).not.toContain("line-user-123");
    expect(debugPayload).not.toContain("profile.png");
  });
});
