import { describe, expect, it } from "vitest";
import { mapBadgeRows } from "@/lib/badge-display";
import type { BadgeDisplayRow } from "@/types/badge";

const baseRow: BadgeDisplayRow = {
  customer_id: "demo-earned",
  display_name: "Nicha Wong",
  line_display_name: "Nicha",
  line_picture_url: null,
  support_message: "Support message",
  badge_code: "alpha-owner",
  badge_name: "Alpha Owner",
  badge_type: "product",
  description: "Own a supported Sony Alpha camera.",
  image_url: "https://example.com/earned.png",
  locked_image_url: "https://example.com/locked.png",
  required_count: 3,
  matched_count: 3,
  serial_number: "SN-A7M4-001",
  model_name: "ILCE-7M4",
  registration_date: "2026-05-20",
};

describe("mapBadgeRows", () => {
  it("returns null when no customer rows exist", () => {
    expect(mapBadgeRows([])).toBeNull();
  });

  it("maps an earned badge with complete product metadata", () => {
    const display = mapBadgeRows([baseRow]);

    expect(display?.customerId).toBe("demo-earned");
    expect(display?.badges[0]).toMatchObject({
      code: "alpha-owner",
      status: "earned",
      progress: 100,
      remainingCount: 0,
      imageUrl: "https://example.com/earned.png",
      serialNumber: "SN-A7M4-001",
      modelName: "ILCE-7M4",
      registrationDate: "2026-05-20",
    });
  });

  it("maps a locked badge with progress and remaining count", () => {
    const display = mapBadgeRows([
      {
        ...baseRow,
        matched_count: 1,
      },
    ]);

    expect(display?.badges[0]).toMatchObject({
      status: "locked",
      progress: 33,
      remainingCount: 2,
      imageUrl: "https://example.com/locked.png",
    });
  });

  it("maps a no-badge state when no products match the rule", () => {
    const display = mapBadgeRows([
      {
        ...baseRow,
        matched_count: null,
        serial_number: null,
        model_name: null,
        registration_date: null,
      },
    ]);

    expect(display?.badges[0]).toMatchObject({
      status: "no-badge",
      progress: 0,
      remainingCount: 3,
      imageUrl: "https://example.com/locked.png",
    });
  });

  it("keeps missing product fields as null for safe display", () => {
    const display = mapBadgeRows([
      {
        ...baseRow,
        serial_number: null,
        model_name: null,
        registration_date: null,
      },
    ]);

    expect(display?.badges[0]).toMatchObject({
      serialNumber: null,
      modelName: null,
      registrationDate: null,
    });
  });
});
