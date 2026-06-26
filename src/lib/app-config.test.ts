import { describe, expect, it } from "vitest";
import { loadAppConfig } from "@/lib/app-config";

describe("loadAppConfig", () => {
  it("loads local defaults for mock Sony API and localhost guard", () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "mysql://sony:sony@127.0.0.1:3307/sony_badges",
      ALLOWED_ORIGINS: "http://localhost:3000",
      ALLOWED_REFERRERS: "http://localhost:3000",
      SONY_PRODUCT_API_MODE: "mock",
      SONY_PRODUCT_API_BASE_URL: "http://localhost:3000/api/mock/sony",
      SONY_DEMO_LINE_UUID: "demo-line-earned",
    });

    expect(config).toMatchObject({
      appEnv: "local",
      appBaseUrl: "http://localhost:3000",
      sonyProductApiMode: "mock",
      sonyDemoLineUuid: "demo-line-earned",
    });
    expect(config.allowedOrigins).toEqual(["http://localhost:3000"]);
    expect(config.sonyProductApiBaseUrl).toBe("http://localhost:3000/api/mock/sony");
  });

  it("rejects missing production LIFF and Sony API configuration", () => {
    expect(() =>
      loadAppConfig({
        APP_ENV: "production",
        APP_BASE_URL: "https://campaign.example.com",
        DATABASE_URL: "mysql://example:example@localhost:3306/example",
        ALLOWED_ORIGINS: "https://campaign.example.com",
        ALLOWED_REFERRERS: "https://campaign.example.com",
        SONY_PRODUCT_API_MODE: "live",
      }),
    ).toThrow(/NEXT_PUBLIC_LIFF_ID/);
  });

  it("requires a subscription key for live Sony APIM mode", () => {
    expect(() =>
      loadAppConfig({
        APP_ENV: "local",
        APP_BASE_URL: "http://localhost:3000",
        SONY_PRODUCT_API_MODE: "live",
        SONY_PRODUCT_API_BASE_URL: "https://apim-rcap-dev.azure-api.net/mysony-api/QueryWarrantyMySonyByLine",
      }),
    ).toThrow(/SONY_PRODUCT_API_SUBSCRIPTION_KEY/);
  });
});
