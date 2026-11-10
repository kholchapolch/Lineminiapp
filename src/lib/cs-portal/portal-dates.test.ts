import { describe, expect, it } from "vitest";
import { formatPortalDate, parseSonyPortalDate } from "@/lib/cs-portal/portal-dates";

describe("parseSonyPortalDate", () => {
  it("treats Sony wall-clock timestamps as Asia/Bangkok", () => {
    const date = parseSonyPortalDate("2026-10-29 10:08:38");
    expect(date).not.toBeNull();
    expect(date!.toISOString()).toBe("2026-10-29T03:08:38.000Z");
  });

  it("treats date-only values as Bangkok midnight", () => {
    const date = parseSonyPortalDate("2026-10-24");
    expect(date).not.toBeNull();
    expect(date!.toISOString()).toBe("2026-10-23T17:00:00.000Z");
  });
});

describe("formatPortalDate", () => {
  it("keeps registration day stable across host timezones", () => {
    // Regression: naive Date("2026-10-29 10:08:38") on US hosts showed 30 Oct in Bangkok.
    expect(formatPortalDate("2026-10-29 10:08:38")).toBe("29 Oct 2026");
  });

  it("formats warranty date-only values in Bangkok", () => {
    expect(formatPortalDate("2026-10-24")).toBe("24 Oct 2026");
  });
});
