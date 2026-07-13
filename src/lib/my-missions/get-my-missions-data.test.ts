import { describe, expect, it } from "vitest";
import {
  getMyMissionsData,
  MY_MISSIONS_REVALIDATE_SECONDS,
} from "@/lib/my-missions/get-my-missions-data";

describe("getMyMissionsData", () => {
  it("returns mock mission sections with tier progress", async () => {
    const data = await getMyMissionsData();

    expect(data.sections).toHaveLength(2);
    expect(data.sections[0]?.tiers).toHaveLength(3);
    expect(data.sections[0]?.tiers[0]?.progress).toBe(5);
    expect(data.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("exposes a revalidate interval for ISR", () => {
    expect(MY_MISSIONS_REVALIDATE_SECONDS).toBeGreaterThan(0);
  });
});
