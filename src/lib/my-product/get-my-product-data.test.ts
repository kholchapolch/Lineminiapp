import { describe, expect, it } from "vitest";
import { formatUnlockedDate } from "@/lib/my-product/format-unlocked-date";

describe("formatUnlockedDate", () => {
  it("formats unlock dates as dd mmm yyyy in English", () => {
    expect(formatUnlockedDate("2026-07-22T00:00:00.000Z", "en")).toBe("22 Jul 2026");
    expect(formatUnlockedDate("2026-07-22T00:00:00.000Z", "th")).toBe("22 Jul 2026");
  });
});
