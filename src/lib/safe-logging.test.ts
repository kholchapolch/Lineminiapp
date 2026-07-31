import { afterEach, describe, expect, it, vi } from "vitest";
import { hashLineUuid, toSafeError } from "@/lib/safe-logging";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("hashLineUuid", () => {
  it("does not return the raw lineuuid", () => {
    const hashed = hashLineUuid("demo-line-earned");

    expect(hashed).not.toBe("demo-line-earned");
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
  });

  it("uses a server secret when one is configured", () => {
    vi.stubEnv("LOG_HASH_SECRET", "secret-a");
    const first = hashLineUuid("demo-line-earned");

    vi.stubEnv("LOG_HASH_SECRET", "secret-b");
    const second = hashLineUuid("demo-line-earned");

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("toSafeError", () => {
  it("maps unknown errors to a safe frontend message", () => {
    expect(toSafeError(new Error("secret token failed"))).toEqual({
      code: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again later.",
    });
  });
});
