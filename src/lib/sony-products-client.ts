import "server-only";

import type { AppConfig } from "@/lib/app-config";
import {
  getMockSonyCustomerProducts,
  SonyCustomerNotFoundError,
} from "@/lib/sony-products";
import { canonicalSku } from "@/lib/sku";
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
  options: { allowMissingRegistrationDate?: boolean; timeoutMs?: number } = {},
): SonyProductsClient {
  if (config.sonyProductApiMode === "live") {
    return new LiveSonyProductsClient({
      endpointUrl: config.sonyProductApiBaseUrl,
      subscriptionKey: config.sonyProductApiSubscriptionKey,
      countryCode: config.sonyProductApiCountryCode,
      ...options,
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
      allowMissingRegistrationDate?: boolean;
      timeoutMs?: number;
    },
  ) {}

  async getCustomerProducts(lineuuid: string): Promise<SonyCustomerProducts> {
    if (!this.options.subscriptionKey) {
      throw new SonyProductApiError(
        "Sony product API subscription key is not configured.",
      );
    }

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
      ...(this.options.timeoutMs ? { signal: AbortSignal.timeout(this.options.timeoutMs) } : {}),
    });

    if (response.status === 404) {
      throw new SonyCustomerNotFoundError();
    }

    if (!response.ok) {
      throw new SonyProductApiError(
        `Sony product API returned ${response.status}.`,
      );
    }

    const payload = (await response.json()) as
      | LiveSonyApiResponse
      | SonyWarrantyApiResponse;

    return normalizeLiveSonyApiResponse(payload, lineuuid, this.options.allowMissingRegistrationDate ?? false);
  }
}

function normalizeLiveSonyApiResponse(
  payload: LiveSonyApiResponse | SonyWarrantyApiResponse,
  lineuuid: string,
  allowMissingRegistrationDate: boolean,
): SonyCustomerProducts {
  // Observed UAT contract: HTTP 200 with code 100 for an unknown LINE ID.
  // Require the known message as well; do not classify unrelated business errors.
  const businessError = payload as { errorCode?: unknown; errorMessage?: unknown } | null;
  if (businessError?.errorCode === "100" && typeof businessError.errorMessage === "string" &&
      /^Line Id .+ is not found in our database$/.test(businessError.errorMessage)) {
    throw new SonyCustomerNotFoundError();
  }
  if (Array.isArray((payload as SonyWarrantyApiResponse).prodDetails)) {
    return normalizeSonyWarrantyResponse(
      payload as SonyWarrantyApiResponse,
      lineuuid,
      allowMissingRegistrationDate,
    );
  }

  return assertSonyCustomerProducts(payload as LiveSonyApiResponse, allowMissingRegistrationDate);
}

function normalizeSonyWarrantyResponse(
  payload: SonyWarrantyApiResponse,
  lineuuid: string,
  allowMissingRegistrationDate: boolean,
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
    products: payload.prodDetails.map(product => {
      if (product?.lineId && product.lineId !== lineuuid) throw new SonyProductApiError("Mismatched product owner.");
      return assertSonyWarrantyProduct(product, allowMissingRegistrationDate);
    }),
  };
}

function assertSonyWarrantyProduct(product: unknown, allowMissingRegistrationDate: boolean): SonyOwnedProduct {
  const candidate = product as SonyWarrantyProduct;

  if (
    !candidate || typeof candidate.modelName !== "string" || !candidate.modelName.trim() ||
    !(typeof candidate.registrationDate === "string" || (allowMissingRegistrationDate && candidate.registrationDate == null))
  ) {
    throw new SonyProductApiError(
      "Sony warranty API response has invalid product fields.",
    );
  }

  return {
    sku: canonicalSku(candidate.modelName),
    modelName: candidate.modelName,
    serialNumber: nullableString(candidate.serialNumber),
    registeredAt: typeof candidate.registrationDate === "string" ? candidate.registrationDate : "",
    warrantyExpiryDate: nullableString(candidate.warrantyExpiryDate),
  };
}

function assertSonyCustomerProducts(
  payload: LiveSonyApiResponse,
  allowMissingRegistrationDate: boolean,
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
    products: payload.products.map(product => assertSonyOwnedProduct(product, allowMissingRegistrationDate)),
  };
}

function assertSonyOwnedProduct(product: unknown, allowMissingRegistrationDate: boolean): SonyOwnedProduct {
  const candidate = product as Partial<SonyOwnedProduct>;

  if (
    !candidate || typeof candidate.sku !== "string" || !candidate.sku.trim() ||
    !(typeof candidate.registeredAt === "string" || (allowMissingRegistrationDate && candidate.registeredAt == null))
  ) {
    throw new SonyProductApiError(
      "Sony product API response has invalid product fields.",
    );
  }

  return {
    sku: candidate.sku,
    modelName: nullableString(candidate.modelName),
    serialNumber: nullableString(candidate.serialNumber),
    registeredAt: candidate.registeredAt ?? "",
    warrantyExpiryDate: nullableString(candidate.warrantyExpiryDate),
  };
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
