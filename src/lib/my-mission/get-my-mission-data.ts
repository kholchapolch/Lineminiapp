import {
  getBadgeExperienceForLineUuid,
  getLockedBadgeExperience,
} from "@/lib/badge-experience-server";
import type { BadgeExperience } from "@/lib/badge-experience";
import type { MyMissionDetailData } from "@/lib/my-mission/types";

export async function getMyMissionData(
  missionId: string,
  lineuuid: string,
): Promise<MyMissionDetailData | null> {
  return mapExperienceToMyMission(
    await getBadgeExperienceForLineUuid(lineuuid),
    missionId,
  );
}

export async function getMyMissionLockedData(
  missionId: string,
): Promise<MyMissionDetailData | null> {
  return mapExperienceToMyMission(await getLockedBadgeExperience(), missionId);
}

function mapExperienceToMyMission(
  experience: BadgeExperience,
  missionId: string,
): MyMissionDetailData | null {
  const quest = experience.questBadges.find((candidate) =>
    candidate.tiers.some((tier) => tier.id === missionId),
  );
  const tier = quest?.tiers.find((candidate) => candidate.id === missionId);

  if (!quest || !tier) {
    return null;
  }

  const tickets = Array.from({ length: tier.requiredCount }, (_, index) => {
    const product = quest.matchedProducts[index];

    return {
      id: `${tier.id}-ticket-${index + 1}`,
      productCode: product?.sku ?? "—",
      imageUrl: "/mock/my-badges/product-lens.svg",
      status: product ? ("completed" as const) : ("pending" as const),
    };
  });

  return {
    mission: {
      id: tier.id,
      sectionId: quest.id as MyMissionDetailData["mission"]["sectionId"],
      badgeImageUrl: tier.imageUrl ?? "",
      shareImageUrl: tier.shareImageUrl ?? tier.imageUrl ?? "",
      progress: tier.matchedCount,
      target: tier.requiredCount,
      unlockedAt: tier.earnedAt ?? undefined,
      tickets,
    },
    fetchedAt: experience.fetchedAt,
  };
}
