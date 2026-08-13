import { getBadgeExperienceForLineUuid } from "@/lib/badge-experience-server";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/locales";
import type { MyBadgesData } from "@/lib/my-badges/types";
import type { MissionSectionId } from "@/lib/my-missions/types";

export async function getMyBadgesData(
  locale: Locale,
  lineuuid: string,
): Promise<MyBadgesData> {
  const experience = await getBadgeExperienceForLineUuid(lineuuid);
  const messages = getDictionary(locale);
  const displayName =
    experience.customer.lineDisplayName ?? experience.customer.displayName;
  const missionBadges = countMissionBadgesFromQuestTiers(experience.questBadges);

  return {
    profile: {
      channelName: "sony-thailand",
      lineDisplayName: displayName,
      linePictureUrl: experience.customer.linePictureUrl,
      handle: "",
      isVerified: true,
      isOnline: true,
      productBadgeCount: experience.productBadges.filter(
        (badge) => badge.status === "unlocked",
      ).length,
      productBadgeTotal: experience.productBadges.length,
      missionBadgeCount: missionBadges.count,
      missionBadgeTotal: missionBadges.total,
    },
    productBadges: experience.recentProductBadges.map((badge) => ({
      id: badge.id,
      title: badge.title,
      imageUrl: badge.imageUrl,
    })),
    missionBadges: experience.recentQuestBadges.map((quest) => {
      const sectionId = quest.id as MissionSectionId;
      const section = messages.myMissions.sections[sectionId];
      const localizedTitle = section?.badgeTitle ?? section?.title;

      return {
        id: quest.highestEarnedTier.id,
        title: localizedTitle ?? quest.title,
        imageUrl: quest.highestEarnedTier.imageUrl,
      };
    }),
    fetchedAt: experience.fetchedAt,
  };
}

/** Counts each mission medal/tier shown on /my-missions (not quest groups). */
export function countMissionBadgesFromQuestTiers(
  questBadges: Array<{ tiers: Array<{ status: string }> }>,
): { count: number; total: number } {
  const missionTiers = questBadges.flatMap((quest) => quest.tiers);

  return {
    count: missionTiers.filter((tier) => tier.status === "achieved").length,
    total: missionTiers.length,
  };
}
