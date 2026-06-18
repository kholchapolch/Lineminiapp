import { describe, expect, it } from "vitest";
import { resolveLineUuid } from "@/lib/lineuuid";

describe("resolveLineUuid", () => {
  it("uses the provided lineuuid when present", () => {
    expect(
      resolveLineUuid({
        appEnv: "production",
        providedLineUuid: " line-user-123 ",
        demoLineUuid: "demo-line-earned",
      }),
    ).toEqual({ lineUuid: "line-user-123", usedDemoFallback: false });
  });

  it("uses demo fallback only in local mode", () => {
    expect(
      resolveLineUuid({
        appEnv: "local",
        providedLineUuid: undefined,
        demoLineUuid: "demo-line-earned",
      }),
    ).toEqual({ lineUuid: "demo-line-earned", usedDemoFallback: true });
  });

  it("does not use demo fallback outside local mode", () => {
    expect(
      resolveLineUuid({
        appEnv: "staging",
        providedLineUuid: undefined,
        demoLineUuid: "demo-line-earned",
      }),
    ).toEqual({ lineUuid: null, usedDemoFallback: false });
  });
});
