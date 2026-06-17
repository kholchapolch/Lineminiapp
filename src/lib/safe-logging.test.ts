import { describe, expect, it } from "vitest";
import { hashLineUuid, toSafeError } from "@/lib/safe-logging";

describe("hashLineUuid", () => {
  it("does not return the raw lineuuid", () => {
    const hashed = hashLineUuid("demo-line-earned");

    expect(hashed).not.toBe("demo-line-earned");
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
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
