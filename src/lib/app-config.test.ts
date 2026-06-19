import { describe, expect, it } from "vitest";
import { loadAppConfig } from "@/lib/app-config";

describe("loadAppConfig", () => {
  it("loads local defaults for mock Sony API and localhost guard", () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgres://sony:sony@localhost:54339/sony_badges",
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
        DATABASE_URL: "postgres://example",
        ALLOWED_ORIGINS: "https://campaign.example.com",
        ALLOWED_REFERRERS: "https://campaign.example.com",
        SONY_PRODUCT_API_MODE: "live",
      }),
    ).toThrow(/NEXT_PUBLIC_LIFF_ID/);
  });
});
