import { describe, expect, it } from "vitest";
import { isDataLayerDebugEnabled } from "@/lib/sony-data-layer-debug";

describe("isDataLayerDebugEnabled", () => {
  it("turns on only for debug=1", () => {
    expect(isDataLayerDebugEnabled("?debug=1", null)).toBe(true);
    expect(isDataLayerDebugEnabled("debug=1", null)).toBe(true);
    expect(isDataLayerDebugEnabled("?debug=true", null)).toBe(false);
    expect(isDataLayerDebugEnabled("", null)).toBe(false);
  });

  it("stays on for the rest of the browser session after debug=1", () => {
    expect(isDataLayerDebugEnabled("", "1")).toBe(true);
    expect(isDataLayerDebugEnabled("?locale=th", "1")).toBe(true);
    expect(isDataLayerDebugEnabled("", null)).toBe(false);
  });
});
