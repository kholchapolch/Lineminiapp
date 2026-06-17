import { describe, expect, it } from "vitest";
import { evaluateRedirectGuard } from "@/lib/redirect-guard";

const allowConfig = {
  allowedOrigins: ["http://localhost:3000", "https://campaign.sony.co.th"],
  allowedReferrers: ["http://localhost:3000", "https://campaign.sony.co.th"],
};

describe("evaluateRedirectGuard", () => {
  it("allows localhost origin and referrer", () => {
    expect(
      evaluateRedirectGuard(
        new Headers({
          origin: "http://localhost:3000",
          referer: "http://localhost:3000/entry?x=1",
        }),
        allowConfig,
      ),
    ).toEqual({ allowed: true });
  });

  it("blocks unknown redirect source", () => {
    expect(
      evaluateRedirectGuard(
        new Headers({
          origin: "https://evil.example",
          referer: "https://evil.example/path",
        }),
        allowConfig,
      ),
    ).toMatchObject({ allowed: false, reason: "blocked-source" });
  });

  it("blocks when any provided redirect source is not allowed", () => {
    expect(
      evaluateRedirectGuard(
        new Headers({
          origin: "https://evil.example",
          referer: "https://campaign.sony.co.th/entry",
        }),
        allowConfig,
      ),
    ).toMatchObject({ allowed: false, reason: "blocked-source" });
  });

  it("blocks missing origin and referrer", () => {
    expect(evaluateRedirectGuard(new Headers(), allowConfig)).toMatchObject({
      allowed: false,
      reason: "missing-source",
    });
  });
});
