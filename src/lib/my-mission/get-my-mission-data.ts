import {
  getBadgeExperienceForLineUuid,
  getLockedBadgeExperience,
} from "@/lib/badge-experience-server";
import type { BadgeExperience, ProductBadgeExperience } from "@/lib/badge-experience";
import type { MissionTicket, MyMissionDetailData } from "@/lib/my-mission/types";
import { matchesEligibleSku } from "@/lib/sku";

const FALLBACK_TICKET_IMAGE = "/mock/my-badges/product-lens.svg";

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

export function mapExperienceToMyMission(
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

  const tickets = buildMissionTickets({
    missionId: tier.id,
    matchedProducts: quest.matchedProducts,
    eligibleSkus: quest.eligibleSkus,
    productBadges: experience.productBadges,
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

function buildMissionTickets({
  missionId,
  matchedProducts,
  eligibleSkus,
  productBadges,
}: {
  missionId: string;
  matchedProducts: BadgeExperience["questBadges"][number]["matchedProducts"];
  eligibleSkus: string[];
  productBadges: ProductBadgeExperience[];
}): MissionTicket[] {
  return eligibleSkus.map((sku, index) => {
    const owned = matchedProducts.some((product) =>
      matchesEligibleSku(product.sku, [sku]),
    );
    const badge = findProductBadge(productBadges, sku);

    return {
      id: `${missionId}-ticket-${index + 1}`,
      productCode: sku,
      imageUrl: badge?.imageUrl ?? FALLBACK_TICKET_IMAGE,
      status: owned ? "completed" : "pending",
      productUrl: badge?.productUrl ?? null,
    };
  });
}

function findProductBadge(
  productBadges: ProductBadgeExperience[],
  sku: string,
): ProductBadgeExperience | undefined {
  return productBadges.find(
    (badge) =>
      badge.modelCode.toUpperCase() === sku.toUpperCase() ||
      matchesEligibleSku(sku, [badge.modelCode]),
  );
}
