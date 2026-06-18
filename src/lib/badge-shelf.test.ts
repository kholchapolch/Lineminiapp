import { describe, expect, it } from "vitest";
import { buildBadgeShelf } from "@/lib/badge-shelf";
import type { BadgeDisplayItem } from "@/types/badge";

const badges: BadgeDisplayItem[] = [
  {
    code: "alpha-tier",
    name: "Alpha Collector - Silver",
    type: "product",
    description: "Collect eligible Sony Alpha camera and G Master lens products.",
    status: "earned",
    progress: 100,
    remainingCount: 0,
    matchedCount: 2,
    requiredCount: 2,
    imageUrl: "https://example.com/alpha-silver.png",
    serialNumber: "SN-A7M4-001",
    modelName: "Alpha 7 IV",
    registrationDate: "2026-05-20",
    level: "silver",
  },
  {
    code: "pro-achievement",
    name: "Pro Achievement - Achievement",
    type: "quest",
    description: "Own three eligible Sony products during the campaign.",
    status: "locked",
    progress: 67,
    remainingCount: 1,
    matchedCount: 2,
    requiredCount: 3,
    imageUrl: "https://example.com/locked.png",
    serialNumber: "SN-A7M4-001",
    modelName: "Alpha 7 IV",
    registrationDate: "2026-05-20",
    level: "achievement",
  },
];

describe("buildBadgeShelf", () => {
  it("returns nine visible shelf badges", () => {
    expect(buildBadgeShelf(badges)).toHaveLength(9);
  });

  it("marks achieved rank badges in full color and unachieved rank badges as dimmed", () => {
    const shelf = buildBadgeShelf(badges);

    expect(shelf.slice(0, 3)).toMatchObject([
      { code: "alpha-bronze", label: "Bronze", status: "achieved", visualState: "color" },
      { code: "alpha-silver", label: "Silver", status: "achieved", visualState: "color" },
      { code: "alpha-gold", label: "Gold", status: "available", visualState: "dimmed" },
    ]);
  });

  it("marks the one-time achievement and future badges as dimmed until achieved", () => {
    const shelf = buildBadgeShelf(badges);

    expect(shelf[3]).toMatchObject({
      code: "pro-achievement",
      label: "Achievement",
      status: "available",
      visualState: "dimmed",
    });
    expect(shelf.slice(4).every((item) => item.visualState === "dimmed")).toBe(true);
  });
});
