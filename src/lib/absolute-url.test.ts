import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBadgeImageBaseUrl,
  toAbsoluteUrl,
  toBadgeImageUrl,
  toShareableAssetUrl,
} from "@/lib/absolute-url";

afterEach(() => {
  vi.unstubAllEnvs();
});
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
    expect(
      toAbsoluteUrl("http://cdn.example.com/a.png", "https://app.example.com"),
    ).toBe("http://cdn.example.com/a.png");
  });

  it("resolves public paths against the app base URL", () => {
    expect(
      toAbsoluteUrl("/badges/SEL50F12GM.png", "https://app.example.com"),
    ).toBe("https://app.example.com/badges/SEL50F12GM.png");
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

describe("getBadgeImageBaseUrl", () => {
  it("prefers BADGE_IMAGE_BASE_URL over APP_BASE_URL", () => {
    vi.stubEnv("BADGE_IMAGE_BASE_URL", "https://sony.blob.azure.url/");
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", "https://app.example.com");

    expect(getBadgeImageBaseUrl()).toBe("https://sony.blob.azure.url");
  });

  it("falls back to APP_BASE_URL when badge host is unset", () => {
    vi.stubEnv("BADGE_IMAGE_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_BADGE_IMAGE_BASE_URL", "");
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", "https://app.example.com");

    expect(getBadgeImageBaseUrl()).toBe("https://app.example.com");
  });
});

describe("toBadgeImageUrl", () => {
  it("joins badge host with a DB image path", () => {
    vi.stubEnv("BADGE_IMAGE_BASE_URL", "https://sony.blob.azure.url");
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");

    expect(toBadgeImageUrl("/product-badge/SEL50F14GM.png")).toBe(
      "https://sony.blob.azure.url/product-badge/SEL50F14GM.png",
    );
  });

  it("joins APP_BASE_URL when badge host is unset", () => {
    vi.stubEnv("BADGE_IMAGE_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_BADGE_IMAGE_BASE_URL", "");
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", "https://app.example.com");

    expect(toBadgeImageUrl("/quest-badge/portrait-bronze.png")).toBe(
      "https://app.example.com/quest-badge/portrait-bronze.png",
    );
  });

  it("keeps absolute image URLs", () => {
    vi.stubEnv("BADGE_IMAGE_BASE_URL", "https://sony.blob.azure.url");

    expect(toBadgeImageUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
  });
});
