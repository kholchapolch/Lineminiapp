import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

function stubLocalEnv() {
  vi.stubEnv("APP_ENV", "local");
  vi.stubEnv("APP_BASE_URL", "http://localhost:3000");
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("SONY_PRODUCT_API_MODE", "mock");
}

function stubProductionEnv() {
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("APP_BASE_URL", "https://campaign.example.com");
  vi.stubEnv("DATABASE_URL", "mysql://sony:sony@127.0.0.1:3307/sony_badges");
  vi.stubEnv("ALLOWED_ORIGINS", "https://campaign.example.com");
  vi.stubEnv("ALLOWED_REFERRERS", "https://campaign.example.com");
  vi.stubEnv("NEXT_PUBLIC_LIFF_ID", "line-liff-id");
  vi.stubEnv("LINE_CHANNEL_ID", "line-channel-id");
  vi.stubEnv("APP_SESSION_SECRET", "test-session-secret");
  vi.stubEnv("SONY_PRODUCT_API_MODE", "mock");
}

describe("GET /api/customer-products", () => {
  it("returns calculated demo badge data for a known lineuuid", async () => {
    stubLocalEnv();

    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.customer).toEqual({
      displayName: "Nicha Wong",
      lineDisplayName: "Nicha",
      linePictureUrl: null,
    });
    expect(payload.productCount).toBe(20);
    expect(payload.products).toBeUndefined();
    expect(payload.badges[0]).toMatchObject({
      code: "ff-camera-owner",
      status: "earned",
      level: "achievement",
      matchedCount: 1,
    });
    expect(payload.badges[0].serialNumber).toBeUndefined();
    expect(payload.badges[0].modelName).toBeUndefined();
    expect(payload.badges[0].registrationDate).toBeUndefined();
    expect(payload.debugTrace).toBeUndefined();
  });

  it("returns cache metadata on a cache miss", async () => {
    stubLocalEnv();

    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.cacheStatus).toBe("miss");
    expect(payload.cache).toMatchObject({
      rulesVersion: "local-fallback",
    });
    expect(payload.cache.customerCacheKey).toEqual(expect.any(String));
    expect(payload.cache.skuHash).toEqual(expect.any(String));
    expect(payload.cache.calculatedAt).toEqual(expect.any(String));
  });

  it("returns a lightweight cache hit when customer, SKU hash, and rules version match", async () => {
    stubLocalEnv();

    const missResponse = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const missPayload = await missResponse.json();
    const hitResponse = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned", {
        headers: {
          "x-badge-cache-customer-key": missPayload.cache.customerCacheKey,
          "x-badge-cache-sku-hash": missPayload.cache.skuHash,
          "x-badge-cache-rules-version": missPayload.cache.rulesVersion,
        },
      }),
    );
    const hitPayload = await hitResponse.json();

    expect(hitResponse.status).toBe(200);
    expect(hitPayload.cacheStatus).toBe("hit");
    expect(hitPayload.badges).toBeUndefined();
    expect(hitPayload.badgeShelf).toBeUndefined();
    expect(hitPayload.cache).toMatchObject({
      customerCacheKey: missPayload.cache.customerCacheKey,
      skuHash: missPayload.cache.skuHash,
      rulesVersion: missPayload.cache.rulesVersion,
    });
  });

  it("bypasses cache hits when debug trace is requested", async () => {
    stubLocalEnv();

    const missResponse = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const missPayload = await missResponse.json();
    const debugResponse = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned&debug=1", {
        headers: {
          "x-badge-cache-customer-key": missPayload.cache.customerCacheKey,
          "x-badge-cache-sku-hash": missPayload.cache.skuHash,
          "x-badge-cache-rules-version": missPayload.cache.rulesVersion,
        },
      }),
    );
    const debugPayload = await debugResponse.json();

    expect(debugResponse.status).toBe(200);
    expect(debugPayload.cacheStatus).toBe("miss");
    expect(debugPayload.debugTrace).toBeDefined();
    expect(debugPayload.badgeShelf.length).toBeGreaterThan(0);
  });

  it("uses the local demo lineuuid when no lineuuid is provided locally", async () => {
    stubLocalEnv();

    const response = await GET(new Request("http://localhost/api/customer-products"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.productCount).toBe(20);
  });

  it("rejects production requests without a server-verified session", async () => {
    stubProductionEnv();

    const response = await GET(
      new Request("https://campaign.example.com/api/customer-products?lineuuid=demo-line-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("UNAUTHORIZED");
  });

  it("returns redacted debug trace when debug is enabled locally", async () => {
    stubLocalEnv();

    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned&debug=1"),
    );
    const payload = await response.json();
    const serialized = JSON.stringify(payload.debugTrace);

    expect(response.status).toBe(200);
    expect(payload.debugTrace.dbRules.badgeShelfSetup.length).toBeGreaterThan(0);
    expect(payload.debugTrace.dbRules.rules).toBeUndefined();
    expect(payload.debugTrace.sonyApiMock.products).toHaveLength(20);
    expect(payload.debugTrace.aggregationResult.badgeShelf.length).toBeGreaterThanOrEqual(9);
    expect(serialized).not.toContain("demo-line-earned");
    expect(serialized).not.toContain("demo-earned");
    expect(serialized).not.toContain("SN-A7M4-001");
    expect(serialized).not.toContain("Alpha 7R V");
    expect(serialized).not.toContain("2026-05-20");
  });

  it("does not return debug trace from env flag without debug query", async () => {
    stubLocalEnv();
    vi.stubEnv("NEXT_PUBLIC_DEBUG_MOCK_JSON", "true");

    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.debugTrace).toBeUndefined();
  });

  it("omits debug trace in production even when requested", async () => {
    stubProductionEnv();

    const response = await GET(
      new Request("https://campaign.example.com/api/customer-products?debug=1"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.debugTrace).toBeUndefined();
  });
});
