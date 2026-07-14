import { describe, expect, it } from "vitest";
import {
  getMyProductsData,
  MY_PRODUCTS_REVALIDATE_SECONDS,
} from "@/lib/my-products/get-my-products-data";

describe("getMyProductsData", () => {
  it("returns mock product badge categories", async () => {
    const data = await getMyProductsData();

    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.categories[0]?.items.length).toBeGreaterThan(0);
    expect(data.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("exposes a revalidate interval for ISR", () => {
    expect(MY_PRODUCTS_REVALIDATE_SECONDS).toBeGreaterThan(0);
  });
});
