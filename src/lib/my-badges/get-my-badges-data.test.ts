import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { countMissionBadgesFromQuestTiers } from "@/lib/my-badges/get-my-badges-data";

describe("countMissionBadgesFromQuestTiers", () => {
  it("counts every my-missions tier, not quest groups", () => {
    const result = countMissionBadgesFromQuestTiers([
      {
        tiers: [
          { status: "achieved" },
          { status: "achieved" },
          { status: "in-progress" },
        ],
      },
      {
        tiers: [{ status: "achieved" }],
      },
      {
        tiers: [{ status: "locked" }],
      },
    ]);

    expect(result).toEqual({ count: 3, total: 5 });
  });
});
