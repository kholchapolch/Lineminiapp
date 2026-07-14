import { describe, expect, it, vi } from "vitest";
import { readLineSessionFromHeaders, createLineSessionCookie } from "@/lib/auth-session";
import { loadAppConfig } from "@/lib/app-config";
import { getServerLineUuid } from "@/lib/line-session-server";
import {
  clearStoredLineUuid,
  LINE_UUID_STORAGE_KEY,
  readStoredLineUuid,
  storeLineUuid,
} from "@/lib/line-session-storage";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("line session storage", () => {
  it("stores and reads line uuid in sessionStorage", () => {
    const storage = new Map<string, string>();

    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });

    storeLineUuid("line-user-123");
    expect(readStoredLineUuid()).toBe("line-user-123");

    clearStoredLineUuid();
    expect(readStoredLineUuid()).toBeNull();
    expect(LINE_UUID_STORAGE_KEY).toBe("sony_line_uuid");
  });
});

describe("getServerLineUuid", () => {
  it("reads line uuid from the signed session cookie", async () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      SONY_PRODUCT_API_MODE: "mock",
    });
    const cookie = createLineSessionCookie({ config, lineuuid: "line-user-123" });
    const { headers } = await import("next/headers");

    vi.mocked(headers).mockReturnValue(new Headers({ cookie }));

    await expect(getServerLineUuid()).resolves.toBe("line-user-123");
  });

  it("returns null when no session cookie exists", async () => {
    const { headers } = await import("next/headers");

    vi.mocked(headers).mockReturnValue(new Headers());

    await expect(getServerLineUuid()).resolves.toBeNull();
  });
});

describe("readLineSessionFromHeaders", () => {
  it("returns null for invalid cookies", () => {
    const config = loadAppConfig({
      APP_ENV: "local",
      APP_BASE_URL: "http://localhost:3000",
      SONY_PRODUCT_API_MODE: "mock",
    });

    expect(readLineSessionFromHeaders(new Headers(), config)).toBeNull();
  });
});
