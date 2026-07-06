import { describe, expect, it, vi } from "vitest";
import {
  createLineSessionCookie,
  resolveAuthorizedLineUuid,
  UnauthorizedError,
} from "@/lib/auth-session";
import { loadAppConfig } from "@/lib/app-config";

vi.mock("server-only", () => ({}));

function productionConfig() {
  return loadAppConfig({
    APP_ENV: "production",
    APP_BASE_URL: "https://campaign.example.com",
    DATABASE_URL: "mysql://sony:sony@127.0.0.1:3307/sony_badges",
    NEXT_PUBLIC_LIFF_ID: "line-liff-id",
    LINE_CHANNEL_ID: "line-channel-id",
    APP_SESSION_SECRET: "test-session-secret",
    SONY_PRODUCT_API_MODE: "mock",
  });
}

describe("LINE session authorization", () => {
  it("does not trust query lineuuid outside local mode", () => {
    expect(() =>
      resolveAuthorizedLineUuid({
        config: productionConfig(),
        headers: new Headers(),
        providedLineUuid: "demo-line-earned",
      }),
    ).toThrow(UnauthorizedError);
  });

  it("resolves a signed session outside local mode", () => {
    const config = productionConfig();
    const cookie = createLineSessionCookie({ config, lineuuid: "demo-line-earned" });

    expect(
      resolveAuthorizedLineUuid({
        config,
        headers: new Headers({ cookie }),
        providedLineUuid: "demo-line-locked",
      }),
    ).toBe("demo-line-earned");
  });

  it("keeps local query lineuuid support only when demo mock mode is explicitly allowed", () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      SONY_PRODUCT_API_MODE: "mock",
    });

    expect(
      resolveAuthorizedLineUuid({
        config,
        headers: new Headers(),
        providedLineUuid: "demo-line-locked",
        allowDemoLineUuid: true,
      }),
    ).toBe("demo-line-locked");
  });

  it("rejects local query lineuuid when demo mock mode is not explicitly allowed", () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      SONY_PRODUCT_API_MODE: "mock",
    });

    expect(() =>
      resolveAuthorizedLineUuid({
        config,
        headers: new Headers(),
        providedLineUuid: "demo-line-locked",
      }),
    ).toThrow(UnauthorizedError);
  });
});
