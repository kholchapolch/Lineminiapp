import { describe, expect, it } from "vitest";
import { formatUnlockedDate } from "@/lib/my-product/format-unlocked-date";

describe("formatUnlockedDate", () => {
  it("formats unlock dates by locale", () => {
    expect(formatUnlockedDate("2025-12-20T00:00:00.000Z", "en")).toContain("2025");
    expect(formatUnlockedDate("2025-12-20T00:00:00.000Z", "th")).toContain("2568");
  });
});
