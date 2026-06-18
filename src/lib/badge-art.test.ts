import { describe, expect, it } from "vitest";
import { getBadgeArtPresentation } from "@/lib/badge-art";

describe("getBadgeArtPresentation", () => {
  it("shows earned badge images without dimming", () => {
    expect(
      getBadgeArtPresentation({ status: "earned", imageUrl: "https://example.com/earned.png" }),
    ).toEqual({
      label: "Earned",
      imageUrl: "https://example.com/earned.png",
      imageClassName: "badgeImage earned",
      isDimmed: false,
    });
  });

  it("dims locked badge images", () => {
    expect(
      getBadgeArtPresentation({ status: "locked", imageUrl: "https://example.com/locked.png" }),
    ).toEqual({
      label: "Locked",
      imageUrl: "https://example.com/locked.png",
      imageClassName: "badgeImage dimmed",
      isDimmed: true,
    });
  });

  it("dims no-badge images", () => {
    expect(
      getBadgeArtPresentation({ status: "no-badge", imageUrl: "https://example.com/no-badge.png" }),
    ).toMatchObject({
      label: "No badge",
      imageClassName: "badgeImage dimmed",
      isDimmed: true,
    });
  });

  it("falls back to a text label when no image URL exists", () => {
    expect(getBadgeArtPresentation({ status: "locked", imageUrl: null })).toEqual({
      label: "Locked",
      imageUrl: null,
      imageClassName: null,
      isDimmed: true,
    });
  });
});
