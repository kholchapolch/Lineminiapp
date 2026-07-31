import { describe, expect, it } from "vitest";
import { toAbsoluteUrl, toShareableAssetUrl } from "@/lib/absolute-url";

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
