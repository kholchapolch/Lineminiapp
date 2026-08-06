import "server-only";

import type { AppConfig } from "@/lib/app-config";
import {
  getMockSonyCustomerProducts,
  SonyCustomerNotFoundError,
} from "@/lib/sony-products";
import type { SonyCustomerProducts, SonyOwnedProduct } from "@/types/badge";

export type SonyProductsClient = {
  getCustomerProducts(lineuuid: string): Promise<SonyCustomerProducts>;
};

type LiveSonyApiResponse = Partial<SonyCustomerProducts>;
type SonyWarrantyProduct = {
  lineId?: unknown;
  serialNumber?: unknown;
  modelName?: unknown;
  registrationDate?: unknown;
  warrantyExpiryDate?: unknown;
};
type SonyWarrantyApiResponse = {
  prodDetails?: unknown;
  errorCode?: unknown;
  errorMessage?: unknown;
};

class SonyProductApiError extends Error {
  code = "SONY_PRODUCT_API_ERROR";
  safeMessage = "Badge data is temporarily unavailable.";

  constructor(message: string) {
    super(message);
    this.name = "SonyProductApiError";
  }
}

export function createSonyProductsClient(
  config: AppConfig,
): SonyProductsClient {
  if (config.sonyProductApiMode === "live") {
    return new LiveSonyProductsClient({
      endpointUrl: config.sonyProductApiBaseUrl,
      subscriptionKey: config.sonyProductApiSubscriptionKey,
      countryCode: config.sonyProductApiCountryCode,
    });
  }

  return {
    getCustomerProducts: getMockSonyCustomerProducts,
  };
}

class LiveSonyProductsClient implements SonyProductsClient {
  constructor(
    private readonly options: {
      endpointUrl: string;
      subscriptionKey?: string;
      countryCode: string;
    },
  ) {}

  async getCustomerProducts(lineuuid: string): Promise<SonyCustomerProducts> {
    if (!this.options.subscriptionKey) {
      throw new SonyProductApiError(
        "Sony product API subscription key is not configured.",
      );
    }

    console.log("getCustomerProducts", lineuuid);

    const response = await fetch(this.options.endpointUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": this.options.subscriptionKey,
      },
      body: JSON.stringify({
        countryCode: this.options.countryCode,
        lineId: lineuuid,
      }),
      cache: "no-store",
    });

    const payload = await readSonyApiJson(response);

    if (response.status === 404 || isSonyLineIdNotFoundPayload(payload)) {
      throw new SonyCustomerNotFoundError();
    }

    if (!response.ok) {
      throw new SonyProductApiError(
        `Sony product API returned ${response.status}.`,
      );
    }

    if (!payload) {
      throw new SonyProductApiError("Sony product API returned an empty body.");
    }

    return normalizeLiveSonyApiResponse(
      payload as LiveSonyApiResponse | SonyWarrantyApiResponse,
      lineuuid,
    );
  }
}

function normalizeLiveSonyApiResponse(
  payload: LiveSonyApiResponse | SonyWarrantyApiResponse,
  lineuuid: string,
): SonyCustomerProducts {
  if (Array.isArray((payload as SonyWarrantyApiResponse).prodDetails)) {
    return normalizeSonyWarrantyResponse(
      payload as SonyWarrantyApiResponse,
      lineuuid,
    );
  }

  return assertSonyCustomerProducts(payload as LiveSonyApiResponse);
}

function normalizeSonyWarrantyResponse(
  payload: SonyWarrantyApiResponse,
  lineuuid: string,
): SonyCustomerProducts {
  if (!Array.isArray(payload.prodDetails)) {
    throw new SonyProductApiError(
      "Sony warranty API response is missing prodDetails.",
    );
  }

  return {
    customer: {
      lineuuid,
      customerId: lineuuid,
      displayName: "Sony Customer",
      lineDisplayName: null,
      linePictureUrl: null,
    },
    products: payload.prodDetails.map(assertSonyWarrantyProduct),
  };
}

function assertSonyWarrantyProduct(product: unknown): SonyOwnedProduct {
  const candidate = product as SonyWarrantyProduct;

  if (
    typeof candidate.modelName !== "string" ||
    typeof candidate.registrationDate !== "string"
  ) {
    throw new SonyProductApiError(
      "Sony warranty API response has invalid product fields.",
    );
  }

  return {
    sku: candidate.modelName,
    modelName: candidate.modelName,
    serialNumber: nullableString(candidate.serialNumber),
    registeredAt: candidate.registrationDate,
  };
}

function assertSonyCustomerProducts(
  payload: LiveSonyApiResponse,
): SonyCustomerProducts {
  if (!payload.customer || !Array.isArray(payload.products)) {
    throw new SonyProductApiError(
      "Sony product API response is missing customer or products.",
    );
  }

  const customer = payload.customer;

  if (
    typeof customer.lineuuid !== "string" ||
    typeof customer.customerId !== "string" ||
    typeof customer.displayName !== "string"
  ) {
    throw new SonyProductApiError(
      "Sony product API response has invalid customer fields.",
    );
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

  if (
    typeof candidate.sku !== "string" ||
    typeof candidate.registeredAt !== "string"
  ) {
    throw new SonyProductApiError(
      "Sony product API response has invalid product fields.",
    );
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

async function readSonyApiJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Sony warranty APIM may return HTTP 200 with:
 * `{ "errorCode": "100", "errorMessage": "Line Id ... is not found..." }`
 */
function isSonyLineIdNotFoundPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const errorCode = (payload as { errorCode?: unknown }).errorCode;
  return errorCode === "100" || errorCode === 100;
}
