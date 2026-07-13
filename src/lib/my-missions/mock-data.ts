import type { MissionSection, MyMissionsData } from "@/lib/my-missions/types";

const TIER_IMAGES = [
  "/mock/my-missions/tier-medal.svg",
  "/mock/my-missions/tier-shield.svg",
  "/mock/my-missions/tier-frame.svg",
] as const;

function buildTiers(prefix: string, progressValues: [number, number, number]): MissionSection["tiers"] {
  return progressValues.map((progress, index) => {
    const target = 5;
    const status =
      progress >= target ? "achieved" : progress > 0 ? "in-progress" : ("locked" as const);

    return {
      id: `${prefix}-tier-${index + 1}`,
      imageUrl: TIER_IMAGES[index] ?? TIER_IMAGES[0],
      progress,
      target,
      status,
    };
  });
}

export const mockMyMissionsCatalog: Omit<MyMissionsData, "fetchedAt"> = {
  sections: [
    {
      id: "portrait-master",
      tiers: buildTiers("portrait-master", [5, 1, 0]),
    },
    {
      id: "wide-architect",
      tiers: buildTiers("wide-architect", [5, 1, 0]),
    },
  ],
};
