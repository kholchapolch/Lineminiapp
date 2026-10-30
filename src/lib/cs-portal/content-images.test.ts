import { describe, expect, it } from "vitest";
import {
  FALLBACK_CONTENT_IMAGE_URL,
  resolveContentImageUrl,
} from "@/lib/cs-portal/content-images";

describe("resolveContentImageUrl", () => {
  it("returns the provided https image url", () => {
    expect(
      resolveContentImageUrl("https://www.sony.co.th/content/article.png"),
    ).toBe("https://www.sony.co.th/content/article.png");
  });

  it("uses the product placeholder when image is missing or blank", () => {
    expect(resolveContentImageUrl(null)).toBe(FALLBACK_CONTENT_IMAGE_URL);
    expect(resolveContentImageUrl(undefined)).toBe(FALLBACK_CONTENT_IMAGE_URL);
    expect(resolveContentImageUrl("")).toBe(FALLBACK_CONTENT_IMAGE_URL);
    expect(resolveContentImageUrl("   ")).toBe(FALLBACK_CONTENT_IMAGE_URL);
  });
});
