import "server-only";

import type { AppConfig } from "@/lib/app-config";
import { getMockSonyCustomerProducts, SonyCustomerNotFoundError } from "@/lib/sony-products";
import type { SonyCustomerProducts, SonyOwnedProduct } from "@/types/badge";

export type SonyProductsClient = {
  getCustomerProducts(lineuuid: string): Promise<SonyCustomerProducts>;
};

type LiveSonyApiResponse = Partial<SonyCustomerProducts>;

class SonyProductApiError extends Error {
  code = "SONY_PRODUCT_API_ERROR";
  safeMessage = "Badge data is temporarily unavailable.";

  constructor(message: string) {
    super(message);
    this.name = "SonyProductApiError";
  }
}

export function createSonyProductsClient(config: AppConfig): SonyProductsClient {
  if (config.sonyProductApiMode === "live") {
    return new LiveSonyProductsClient(config.sonyProductApiBaseUrl);
  }

  return {
    getCustomerProducts: getMockSonyCustomerProducts,
  };
}

class LiveSonyProductsClient implements SonyProductsClient {
  constructor(private readonly endpointUrl: string) {}

  async getCustomerProducts(lineuuid: string): Promise<SonyCustomerProducts> {
    const url = new URL(this.endpointUrl);
    url.searchParams.set("lineuuid", lineuuid);

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      throw new SonyCustomerNotFoundError();
    }

    if (!response.ok) {
      throw new SonyProductApiError(`Sony product API returned ${response.status}.`);
    }

    const payload = await response.json() as LiveSonyApiResponse;
    return assertSonyCustomerProducts(payload);
  }
}

function assertSonyCustomerProducts(payload: LiveSonyApiResponse): SonyCustomerProducts {
  if (!payload.customer || !Array.isArray(payload.products)) {
    throw new SonyProductApiError("Sony product API response is missing customer or products.");
  }

  const customer = payload.customer;

  if (
    typeof customer.lineuuid !== "string" ||
    typeof customer.customerId !== "string" ||
    typeof customer.displayName !== "string"
  ) {
    throw new SonyProductApiError("Sony product API response has invalid customer fields.");
  }

  return {
    customer: {
      lineuuid: customer.lineuuid,
      customerId: customer.customerId,
      displayName: customer.displayName,
      lineDisplayName: nullableString(customer.lineDisplayName),
      linePictureUrl: nullableString(customer.linePictureUrl),
    },
    products: payload.products.map(assertSonyOwnedProduct),
  };
}

function assertSonyOwnedProduct(product: unknown): SonyOwnedProduct {
  const candidate = product as Partial<SonyOwnedProduct>;

  if (typeof candidate.sku !== "string" || typeof candidate.registeredAt !== "string") {
    throw new SonyProductApiError("Sony product API response has invalid product fields.");
  }

  return {
    sku: candidate.sku,
    modelName: nullableString(candidate.modelName),
    serialNumber: nullableString(candidate.serialNumber),
    registeredAt: candidate.registeredAt,
  };
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
