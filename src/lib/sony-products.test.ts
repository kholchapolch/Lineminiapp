import { describe, expect, it } from "vitest";
import { getMockSonyCustomerProducts } from "@/lib/sony-products";
import { normalizeSku } from "@/lib/sku";

describe("normalizeSku", () => {
  it("normalizes whitespace and case for indexed matching", () => {
    expect(normalizeSku(" ilce-7m4 ")).toBe("ILCE-7M4");
  });
});

describe("getMockSonyCustomerProducts", () => {
  it("returns customer profile and owned products for a demo lineuuid", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-earned");

    expect(result.customer.lineuuid).toBe("demo-line-earned");
    expect(result.products).toHaveLength(26);
    expect(result.products[0]).toMatchObject({
      sku: "ILCE-7RM5",
      modelName: "Alpha 7R V",
      serialNumber: "SN-A7M4-001",
      registeredAt: "2026-05-20",
    });
    expect(result.products.some((product) => product.sku === "SHARED-TIER-01")).toBe(true);
    expect(result.products.some((product) => product.sku === "GM-SKU-10")).toBe(true);
    expect(result.products.some((product) => product.sku === "SEL2070G")).toBe(true);
    expect(result.products.some((product) => product.sku === "SEL50150GM")).toBe(true);
  });

  it("returns a locked scenario for a demo customer with one product", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-locked");

    expect(result.products).toHaveLength(1);
    expect(result.products[0].sku).toBe("ILCE-7CM2");
  });

  it("returns tier demo customers for bronze, silver, and gold product counts", async () => {
    const bronze = await getMockSonyCustomerProducts("demo-line-tier-bronze");
    const silver = await getMockSonyCustomerProducts("demo-line-tier-silver");
    const gold = await getMockSonyCustomerProducts("demo-line-tier-gold");

    expect(bronze.products).toHaveLength(1);
    expect(silver.products).toHaveLength(5);
    expect(gold.products).toHaveLength(19);
    expect(gold.products[0].sku).toBe("SHARED-TIER-01");
    expect(gold.products[9].sku).toBe("BODY-SKU-10");
    expect(gold.products[18].sku).toBe("GM-SKU-10");
  });

  it("returns a mixed tier customer with body silver and GM gold products", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-tier-body-silver-gm-gold");

    expect(result.products).toHaveLength(14);
    expect(result.products.filter((product) => product.sku.startsWith("BODY-SKU-"))).toHaveLength(4);
    expect(result.products.filter((product) => product.sku.startsWith("GM-SKU-"))).toHaveLength(9);
    expect(result.products.filter((product) => product.sku === "SHARED-TIER-01")).toHaveLength(1);
  });

  it("returns a mock customer using the Sony warranty API sample shape", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-sony-warranty-contract");

    expect(result.products).toEqual([
      {
        sku: "ZV-E10M2/BQ AP2",
        modelName: "ZV-E10M2/BQ AP2",
        serialNumber: "1000003",
        registeredAt: "2026-03-25",
      },
      {
        sku: "SEL70200GM2QSYX",
        modelName: "SEL70200GM2QSYX",
        serialNumber: "2000004",
        registeredAt: "2026-03-25",
      },
    ]);
  });

  it("returns missing metadata while preserving matchable SKU data", async () => {
    const result = await getMockSonyCustomerProducts("demo-line-missing-data");

    expect(result.products[0]).toMatchObject({
      sku: "ILCE-7CM2",
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
