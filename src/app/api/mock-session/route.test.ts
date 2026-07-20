import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAppConfig } from "@/lib/app-config";
import { readLineSessionFromHeaders } from "@/lib/auth-session";
import { getMockProductsFromLineUuid } from "@/lib/sku-mock";
import { GET } from "./route";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/mock-session", () => {
  it("creates a signed local session for supplied SKUs", async () => {
    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("APP_BASE_URL", "http://localhost:3000");
    vi.stubEnv("SONY_PRODUCT_API_MODE", "mock");

    const response = await GET(
      new Request(
        "http://localhost:3000/api/mock-session?locale=th&sku=SEL2470GM2&sku=SEL2470GM2,SEL90M28G",
      ),
    );
    const cookie = response.headers.get("set-cookie") ?? "";
    const session = readLineSessionFromHeaders(
      new Headers({ cookie: cookie.split(";")[0] ?? "" }),
      loadAppConfig(),
    );
    const products = session ? getMockProductsFromLineUuid(session.lineuuid) : null;

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/th/my-badges");
    expect(products?.products.map((product) => product.sku)).toEqual([
      "SEL2470GM2",
      "SEL2470GM2",
      "SEL90M28G",
    ]);
  });

  it("rejects the mock-session route outside local mode", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("APP_BASE_URL", "https://campaign.example.com");
    vi.stubEnv("DATABASE_URL", "mysql://example");
    vi.stubEnv("NEXT_PUBLIC_LIFF_ID", "liff-id");
    vi.stubEnv("LINE_CHANNEL_ID", "channel-id");
    vi.stubEnv("APP_SESSION_SECRET", "session-secret");
    vi.stubEnv("SONY_PRODUCT_API_MODE", "mock");

    const response = await GET(
      new Request("https://campaign.example.com/api/mock-session?sku=SEL2470GM2"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ code: "NOT_FOUND" });
  });
});
