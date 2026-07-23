import { describe, expect, it } from "vitest";
import { toAbsoluteUrl } from "@/lib/absolute-url";

describe("toAbsoluteUrl", () => {
  it("uses https URLs as-is without APP_BASE_URL", () => {
    expect(
      toAbsoluteUrl(
        "https://cdn.example.com/badges/SEL50F12GM.png",
        "https://app.example.com",
      ),
    ).toBe("https://cdn.example.com/badges/SEL50F12GM.png");
  });

  it("uses http URLs as-is without APP_BASE_URL", () => {
    expect(toAbsoluteUrl("http://cdn.example.com/a.png", "https://app.example.com")).toBe(
      "http://cdn.example.com/a.png",
    );
  });

  it("resolves public paths against the app base URL", () => {
    expect(toAbsoluteUrl("/badges/SEL50F12GM.png", "https://app.example.com")).toBe(
      "https://app.example.com/badges/SEL50F12GM.png",
    );
  });

  it("returns null for empty values", () => {
    expect(toAbsoluteUrl(null, "https://app.example.com")).toBeNull();
    expect(toAbsoluteUrl("   ", "https://app.example.com")).toBeNull();
  });
});
