import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/customer-products", () => {
  it("returns calculated demo badge data for a known lineuuid", async () => {
    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.customer.lineuuid).toBe("demo-line-earned");
    expect(payload.customer.customerId).toBe("demo-earned");
    expect(payload.products).toHaveLength(3);
    expect(payload.badges[0]).toMatchObject({
      code: "alpha-tier",
      status: "earned",
      level: "gold",
      matchedCount: 3,
    });
    expect(payload.debugTrace).toBeUndefined();
  });

  it("rejects missing lineuuid", async () => {
    const response = await GET(new Request("http://localhost/api/customer-products"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      code: "MISSING_LINEUUID",
      message: "lineuuid is required.",
    });
  });

  it("rejects legacy customerId-only lookup", async () => {
    const response = await GET(
      new Request("http://localhost/api/customer-products?customerId=demo-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("MISSING_LINEUUID");
  });

  it("returns redacted debug trace when debug is enabled locally", async () => {
    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned&debug=1"),
    );
    const payload = await response.json();
    const serialized = JSON.stringify(payload.debugTrace);

    expect(response.status).toBe(200);
    expect(payload.debugTrace.dbRules.rules.length).toBeGreaterThan(0);
    expect(payload.debugTrace.sonyApiMock.products).toHaveLength(3);
    expect(payload.debugTrace.aggregationResult.badgeShelf).toHaveLength(9);
    expect(serialized).not.toContain("demo-line-earned");
    expect(serialized).not.toContain("demo-earned");
    expect(serialized).not.toContain("SN-A7M4-001");
    expect(serialized).not.toContain("Alpha 7 IV");
    expect(serialized).not.toContain("2026-05-20");
  });

  it("does not return debug trace from env flag without debug query", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEBUG_MOCK_JSON", "true");

    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.debugTrace).toBeUndefined();
  });

  it("omits debug trace in production even when requested", async () => {
    vi.stubEnv("APP_ENV", "production");

    const response = await GET(
      new Request("http://localhost/api/customer-products?lineuuid=demo-line-earned&debug=1"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.debugTrace).toBeUndefined();
  });
});
