import { describe, expect, it } from "vitest";
import {
  createMockSkuLineUuid,
  getMockProductsFromLineUuid,
  parseMockSkuValues,
} from "@/lib/sku-mock";

describe("SKU mock mode", () => {
  it("accepts repeated and comma-separated SKU parameters", () => {
    expect(parseMockSkuValues(["SEL2470GM2, SEL70200GM2", "SEL2470GM2"])).toEqual([
      "SEL2470GM2",
      "SEL70200GM2",
      "SEL2470GM2",
    ]);
  });

  it("round-trips products while preserving duplicate registrations", () => {
    const lineuuid = createMockSkuLineUuid(["SEL2470GM2", "SEL2470GM2", "SEL90M28G"]);
    const result = getMockProductsFromLineUuid(lineuuid);

    expect(result?.customer.lineDisplayName).toBe("SKU Mock");
    expect(result?.products.map((product) => product.sku)).toEqual([
      "SEL2470GM2",
      "SEL2470GM2",
      "SEL90M28G",
    ]);
    expect(new Set(result?.products.map((product) => product.serialNumber)).size).toBe(3);
  });

  it("does not interpret ordinary LINE identities as SKU mocks", () => {
    expect(getMockProductsFromLineUuid("real-line-user")).toBeNull();
  });
});
