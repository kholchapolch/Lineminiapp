import {
  getBadgeExperienceForLineUuid,
  getLockedBadgeExperience,
} from "@/lib/badge-experience-server";
import type { BadgeExperience } from "@/lib/badge-experience";
import type { MyMissionsData } from "@/lib/my-missions/types";

export async function getMyMissionsData(lineuuid: string): Promise<MyMissionsData> {
  return mapExperienceToMyMissions(await getBadgeExperienceForLineUuid(lineuuid));
}

export async function getMyMissionsLockedData(): Promise<MyMissionsData> {
  return mapExperienceToMyMissions(await getLockedBadgeExperience());
}

function mapExperienceToMyMissions(experience: BadgeExperience): MyMissionsData {
  return {
    sections: experience.questBadges.map((quest) => ({
      id: quest.id as MyMissionsData["sections"][number]["id"],
      tiers: quest.tiers.map((tier) => ({
        id: tier.id,
        imageUrl: tier.imageUrl ?? "",
        progress: tier.matchedCount,
        target: tier.requiredCount,
        status: tier.status,
      })),
    })),
    fetchedAt: experience.fetchedAt,
  };
}
