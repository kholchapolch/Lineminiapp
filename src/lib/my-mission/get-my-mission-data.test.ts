import { describe, expect, it } from "vitest";
import { getMyMissionData, MY_MISSION_REVALIDATE_SECONDS } from "@/lib/my-mission/get-my-mission-data";
import { isMissionComplete } from "@/lib/my-mission/types";

describe("getMyMissionData", () => {
  it("returns completed mission detail when progress is maxed", async () => {
    const data = await getMyMissionData("portrait-master-tier-1");

    expect(data?.mission.progress).toBe(5);
    expect(data?.mission.target).toBe(5);
    expect(isMissionComplete(data!.mission)).toBe(true);
    expect(data?.mission.unlockedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns in-progress mission detail with ticket list", async () => {
    const data = await getMyMissionData("wide-architect-tier-2");

    expect(data?.mission.progress).toBe(1);
    expect(isMissionComplete(data!.mission)).toBe(false);
    expect(data?.mission.tickets).toHaveLength(5);
    expect(data?.mission.tickets.filter((ticket) => ticket.status === "completed")).toHaveLength(1);
  });

  it("returns null for unknown mission ids", async () => {
    await expect(getMyMissionData("unknown-mission")).resolves.toBeNull();
  });

  it("exposes a revalidate interval for ISR", () => {
    expect(MY_MISSION_REVALIDATE_SECONDS).toBeGreaterThan(0);
  });
});
