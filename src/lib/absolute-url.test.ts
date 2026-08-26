import { describe, expect, it } from "vitest";
import {
  toAbsoluteUrl,
  toFacebookSharerUrl,
  toShareableAssetUrl,
} from "@/lib/absolute-url";

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

  it("percent-encodes spaces and ampersands in path segments", () => {
    expect(
      toAbsoluteUrl(
        "/Product Badge/Wide & Normal Zoom Lens/SEL2450G.png",
        "https://app.example.com",
      ),
    ).toBe(
      "https://app.example.com/Product%20Badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2450G.png",
    );
  });

  it("encodes spaces in already-absolute URLs", () => {
    expect(
      toAbsoluteUrl(
        "https://ctk.ctk-playground.cc/Product Badge/Full Frame Camera/ILCE-1M2.png",
        "https://app.example.com",
      ),
    ).toBe(
      "https://ctk.ctk-playground.cc/Product%20Badge/Full%20Frame%20Camera/ILCE-1M2.png",
    );
  });

  it("returns null for empty values", () => {
    expect(toAbsoluteUrl(null, "https://app.example.com")).toBeNull();
    expect(toAbsoluteUrl("   ", "https://app.example.com")).toBeNull();
  });
});

describe("toShareableAssetUrl", () => {
  it("never leaves raw spaces in the share URL", () => {
    expect(
      toShareableAssetUrl(
        "/Product Badge/Full Frame Camera/ILCE-1M2.png",
        "https://ctk.ctk-playground.cc",
      ),
    ).toBe(
      "https://ctk.ctk-playground.cc/Product%20Badge/Full%20Frame%20Camera/ILCE-1M2.png",
    );
  });
});

describe("toFacebookSharerUrl", () => {
  it("encodes path spaces as %252520 inside the u param (FB-safe)", () => {
    const assetUrl =
      "https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Macro%20Lens/SEL100M28GM.png";
    const sharer = toFacebookSharerUrl(assetUrl);

    expect(sharer).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmysonybadgestoragestg.blob.core.windows.net%2Fproduct-badge%2FMacro%252520Lens%2FSEL100M28GM.png",
    );
    expect(sharer).toContain("Macro%252520Lens");

    // One query decode leaves `%2520` so a further FB decode still has `%20`.
    const decodedOnce = new URL(sharer!).searchParams.get("u");
    expect(decodedOnce).toBe(
      "https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Macro%2520Lens/SEL100M28GM.png",
    );
  });

  it("returns null for empty or raw-space URLs", () => {
    expect(toFacebookSharerUrl(null)).toBeNull();
    expect(toFacebookSharerUrl("")).toBeNull();
    expect(
      toFacebookSharerUrl(
        "https://example.com/product-badge/Prime Lens/SEL30M35.png",
      ),
    ).toBeNull();
  });
});
