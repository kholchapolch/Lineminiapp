import { describe, expect, it } from "vitest";
import { formatUnlockedDate } from "@/lib/my-product/format-unlocked-date";
import {
  getMyProductData,
  MY_PRODUCT_REVALIDATE_SECONDS,
} from "@/lib/my-product/get-my-product-data";

describe("getMyProductData", () => {
  it("returns mock product detail for a known product id", async () => {
    const data = await getMyProductData("fe-24-70-gm2");

    expect(data?.product.title).toBe("FE 24-70mm F2.8 GM II");
    expect(data?.product.quantity).toBe(3);
    expect(data?.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns null for unknown product ids", async () => {
    await expect(getMyProductData("unknown-product")).resolves.toBeNull();
  });

  it("exposes a revalidate interval for ISR", () => {
    expect(MY_PRODUCT_REVALIDATE_SECONDS).toBeGreaterThan(0);
  });
});

describe("formatUnlockedDate", () => {
  it("formats unlock dates by locale", () => {
    expect(formatUnlockedDate("2025-12-20T00:00:00.000Z", "en")).toContain("2025");
    expect(formatUnlockedDate("2025-12-20T00:00:00.000Z", "th")).toContain("2568");
  });
});
