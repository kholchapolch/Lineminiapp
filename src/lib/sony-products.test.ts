import { describe, expect, it } from "vitest";
import { getMockSonyCustomerProducts, normalizeSku } from "@/lib/sony-products";

describe("normalizeSku", () => {
  it("normalizes whitespace and case for indexed matching", () => {
    expect(normalizeSku(" ilce-7m4 ")).toBe("ILCE-7M4");
  });
});

describe("getMockSonyCustomerProducts", () => {
  it("returns customer profile and owned products for a demo lineuuid", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-earned");

    expect(result.customer.lineuuid).toBe("demo-line-earned");
    expect(result.products[0]).toMatchObject({
      sku: "ILCE-7M4",
      modelName: "Alpha 7 IV",
      serialNumber: "SN-A7M4-001",
      registeredAt: "2026-05-20",
    });
  });

  it("returns a locked scenario for a demo customer with one product", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-locked");

    expect(result.products).toHaveLength(1);
    expect(result.products[0].sku).toBe("ILCE-7M4");
  });

  it("returns missing metadata while preserving matchable SKU data", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-missing-data");

    expect(result.products[0]).toMatchObject({
      sku: "ILCE-7M4",
      modelName: null,
      serialNumber: null,
      registeredAt: "2026-05-20",
    });
  });

  it("returns an empty product list for a no-badge demo customer", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-empty");

    expect(result.products).toEqual([]);
  });

  it("throws a safe not-found error for an unknown customer", async () => {
    await expect(getMockSonyCustomerProducts("unknown-lineuuid")).rejects.toMatchObject({
      code: "CUSTOMER_NOT_FOUND",
      safeMessage: "Customer profile was not found.",
    });
  });
});
