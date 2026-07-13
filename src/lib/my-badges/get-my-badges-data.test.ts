import { describe, expect, it } from "vitest";
import { getMyBadgesData, MY_BADGES_REVALIDATE_SECONDS } from "@/lib/my-badges/get-my-badges-data";

describe("getMyBadgesData", () => {
  it("returns mock profile and badge collections for each locale", async () => {
    const data = await getMyBadgesData("th");

    expect(data.profile.displayName).toBe("Katty Robin");
    expect(data.productBadges).toHaveLength(2);
    expect(data.missionBadges).toHaveLength(2);
    expect(data.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("exposes a revalidate interval for ISR", () => {
    expect(MY_BADGES_REVALIDATE_SECONDS).toBeGreaterThan(0);
  });
});
