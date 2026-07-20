import { getBadgeExperienceForLineUuid } from "@/lib/badge-experience-server";
import type { MyMissionsData } from "@/lib/my-missions/types";

export async function getMyMissionsData(lineuuid: string): Promise<MyMissionsData> {
  const experience = await getBadgeExperienceForLineUuid(lineuuid);

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
