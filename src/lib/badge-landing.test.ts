import { describe, expect, it } from "vitest";
import { loadAppConfig } from "@/lib/app-config";
import { getLocalPreviewLineUuid, resolveBadgeLandingMode } from "@/lib/badge-landing";

describe("badge landing mode", () => {
  it("opens the new design directly for a local mock preview", () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      SONY_PRODUCT_API_MODE: "mock",
      SONY_DEMO_LINE_UUID: "demo-customer",
    });

    expect(resolveBadgeLandingMode(config)).toBe("local-preview");
    expect(getLocalPreviewLineUuid(config, true)).toBe("demo-customer");
  });

  it("keeps diagnostics explicit and production behind LINE verification", () => {
    const localConfig = loadAppConfig({ APP_ENV: "local", SONY_PRODUCT_API_MODE: "mock" });
    const productionConfig = loadAppConfig({
      APP_ENV: "production",
      APP_BASE_URL: "https://campaign.example.com",
      DATABASE_URL: "mysql://example",
      NEXT_PUBLIC_LIFF_ID: "liff-id",
      LINE_CHANNEL_ID: "channel-id",
      APP_SESSION_SECRET: "session-secret",
      SONY_PRODUCT_API_MODE: "mock",
    });

    expect(resolveBadgeLandingMode(localConfig, "1")).toBe("diagnostic");
    expect(resolveBadgeLandingMode(productionConfig)).toBe("line-session");
    expect(getLocalPreviewLineUuid(productionConfig, true)).toBeNull();
  });
});
