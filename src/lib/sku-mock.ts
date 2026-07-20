import { normalizeSku } from "@/lib/sku";
import type { SonyCustomerProducts } from "@/types/badge";

const MOCK_SKU_PREFIX = "local-sku-mock:";
const MAX_MOCK_PRODUCTS = 20;
const MAX_SKU_LENGTH = 80;

export function parseMockSkuValues(values: string[]): string[] {
  return values
    .flatMap((value) => value.split(","))
    .map((value) => normalizeSku(value))
    .filter((value) => value.length > 0 && value.length <= MAX_SKU_LENGTH)
    .slice(0, MAX_MOCK_PRODUCTS);
}

export function createMockSkuLineUuid(skus: string[]): string {
  const normalizedSkus = parseMockSkuValues(skus);
  const payload = Buffer.from(JSON.stringify(normalizedSkus), "utf8").toString("base64url");
  return `${MOCK_SKU_PREFIX}${payload}`;
}

export function getMockProductsFromLineUuid(lineuuid: string): SonyCustomerProducts | null {
  if (!lineuuid.startsWith(MOCK_SKU_PREFIX)) {
    return null;
  }

  try {
    const encoded = lineuuid.slice(MOCK_SKU_PREFIX.length);
    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));

    if (!Array.isArray(decoded) || decoded.some((value) => typeof value !== "string")) {
      return null;
    }

    const skus = parseMockSkuValues(decoded);

    return {
      customer: {
        lineuuid,
        customerId: "local-sku-mock",
        displayName: "SKU Mock Customer",
        lineDisplayName: "SKU Mock",
        linePictureUrl: null,
      },
      products: skus.map((sku, index) => ({
        sku,
        modelName: sku,
        serialNumber: `MOCK-${String(index + 1).padStart(3, "0")}`,
        registeredAt: mockRegistrationDate(index),
      })),
    };
  } catch {
    return null;
  }
}

function mockRegistrationDate(index: number): string {
  const date = new Date(Date.UTC(2026, 6, 1 + index));
  return date.toISOString().slice(0, 10);
}
