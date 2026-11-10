import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/cs-portal/portal-liff-id", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/cs-portal/portal-liff-id")
  >("@/lib/cs-portal/portal-liff-id");
  return {
    ...actual,
    resolvePortalLiffId: vi.fn(async () => "2011513497-JuXfJCbC"),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function stubProductionEnv() {
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("APP_BASE_URL", "https://campaign.example.com");
  vi.stubEnv("DATABASE_URL", "mysql://sony:sony@127.0.0.1:3307/sony_badges");
  vi.stubEnv("NEXT_PUBLIC_LIFF_ID", "line-liff-id");
  vi.stubEnv("NEXT_PUBLIC_CSR_PORTAL_LIFF_ID", "2011513497-JuXfJCbC");
  vi.stubEnv("LINE_CHANNEL_ID", "line-channel-id");
  vi.stubEnv("APP_SESSION_SECRET", "test-session-secret");
  vi.stubEnv("SONY_PRODUCT_API_MODE", "mock");
}

describe("POST /api/line-session", () => {
  it("rejects missing LINE ID token", async () => {
    stubProductionEnv();

    const response = await POST(
      new Request("https://campaign.example.com/api/line-session", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("MISSING_ID_TOKEN");
  });

  it("sets an HTTP-only session cookie after LINE verifies the ID token", async () => {
    stubProductionEnv();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          sub: "line-user-001",
          aud: "line-channel-id",
          exp: Math.floor(Date.now() / 1000) + 300,
        }),
      ),
    );

    const response = await POST(
      new Request("https://campaign.example.com/api/line-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: "id-token" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("sony_line_session=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });

  it("accepts a portal LIFF channel when verifying the ID token", async () => {
    stubProductionEnv();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        const body = String(init?.body ?? "");
        if (body.includes("client_id=2011513497")) {
          return Response.json({
            sub: "line-user-portal",
            aud: "2011513497",
            exp: Math.floor(Date.now() / 1000) + 300,
          });
        }
        return new Response("invalid", { status: 400 });
      }),
    );

    const response = await POST(
      new Request("https://campaign.example.com/api/line-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: "portal-id-token" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("sony_line_session=");
  });
});
