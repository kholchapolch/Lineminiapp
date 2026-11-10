import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAppConfig } from "@/lib/app-config";

const query = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  getPool: () => ({ execute: query, query }),
}));

describe("portal-liff-id", () => {
  beforeEach(() => {
    query.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function loadModule() {
    return import("./portal-liff-id");
  }

  it("prefers a non-empty app_config value over env", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://sony:sony@127.0.0.1:3307/sony_badges");
    vi.stubEnv("NEXT_PUBLIC_CSR_PORTAL_LIFF_ID", "2010000000-from-env");
    query.mockResolvedValueOnce([[{ value: "2011513497-JuXfJCbC" }]]);

    const { resolvePortalLiffId, clearPortalLiffIdCache } = await loadModule();
    clearPortalLiffIdCache();

    await expect(resolvePortalLiffId({ bypassCache: true })).resolves.toBe(
      "2011513497-JuXfJCbC",
    );
  });

  it("falls back to env when the DB row is missing or blank", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://sony:sony@127.0.0.1:3307/sony_badges");
    vi.stubEnv("NEXT_PUBLIC_CSR_PORTAL_LIFF_ID", "2010000000-from-env");
    query.mockResolvedValueOnce([[{ value: "   " }]]);

    const { resolvePortalLiffId, clearPortalLiffIdCache } = await loadModule();
    clearPortalLiffIdCache();

    await expect(resolvePortalLiffId({ bypassCache: true })).resolves.toBe(
      "2010000000-from-env",
    );
  });

  it("falls back to env when MySQL is unreachable", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://sony:sony@127.0.0.1:3307/sony_badges");
    vi.stubEnv("NEXT_PUBLIC_CSR_PORTAL_LIFF_ID", "2010000000-from-env");
    query.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    const { resolvePortalLiffId, clearPortalLiffIdCache } = await loadModule();
    clearPortalLiffIdCache();

    await expect(resolvePortalLiffId({ bypassCache: true })).resolves.toBe(
      "2010000000-from-env",
    );
  });

  it("merges the portal LIFF channel into AppConfig.lineChannelIds", async () => {
    const { withPortalLiffChannel } = await loadModule();
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      LINE_CHANNEL_ID: "2010142840",
      NEXT_PUBLIC_CSR_PORTAL_LIFF_ID: "2010000000-from-env",
      SONY_PRODUCT_API_MODE: "mock",
    });

    const merged = withPortalLiffChannel(config, "2011513497-JuXfJCbC");
    expect(merged.lineChannelIds).toEqual(
      expect.arrayContaining(["2010142840", "2010000000", "2011513497"]),
    );
  });
});
