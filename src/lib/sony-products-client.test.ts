import { afterEach, describe, expect, it, vi } from "vitest";
import { createSonyProductsClient } from "@/lib/sony-products-client";
import type { AppConfig } from "@/lib/app-config";

vi.mock("server-only", () => ({}));

const liveConfig: AppConfig = {
  appEnv: "local",
  appBaseUrl: "http://localhost:3000",
  allowedOrigins: ["http://localhost:3000"],
  allowedReferrers: ["http://localhost:3000"],
  lineVerifyIdTokenUrl: "https://api.line.me/oauth2/v2.1/verify",
  sonyProductApiMode: "live",
  sonyProductApiBaseUrl: "https://apim-rcap-dev.azure-api.net/mysony-api/QueryWarrantyMySonyByLine",
  sonyProductApiSubscriptionKey: "test-subscription-key",
  sonyProductApiCountryCode: "th",
  sonyDemoLineUuid: "demo-line-earned",
};

describe("createSonyProductsClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to Sony warranty APIM and maps prodDetails to owned products", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          prodDetails: [
            {
              lineId: "U_TEST_LINE_ID",
              serialNumber: "1000003",
              modelName: "ZV-E10M2/BQ AP2",
              registrationDate: "2026-03-25",
              warrantyExpiryDate: "2027-06-23",
            },
            {
              lineId: "U_TEST_LINE_ID",
              serialNumber: "2000004",
              modelName: "SEL70200GM2QSYX",
              registrationDate: "2026-03-25",
              warrantyExpiryDate: "2027-06-16",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await createSonyProductsClient(liveConfig).getCustomerProducts(
      "U_TEST_LINE_ID",
    );

    expect(fetchMock).toHaveBeenCalledWith(liveConfig.sonyProductApiBaseUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": "test-subscription-key",
      },
      body: JSON.stringify({
        countryCode: "th",
        lineId: "U_TEST_LINE_ID",
      }),
      cache: "no-store",
    });
    expect(result).toMatchObject({
      customer: {
        lineuuid: "U_TEST_LINE_ID",
        customerId: "U_TEST_LINE_ID",
        displayName: "Sony Customer",
      },
      products: [
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
      ],
    });
  });
});
