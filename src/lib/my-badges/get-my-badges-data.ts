import type { Locale } from "@/lib/i18n/locales";
import { getBadgeExperienceForLineUuid } from "@/lib/badge-experience-server";
import type { MyBadgesData } from "@/lib/my-badges/types";

export async function getMyBadgesData(
  locale: Locale,
  lineuuid: string,
): Promise<MyBadgesData> {
  const experience = await getBadgeExperienceForLineUuid(lineuuid);
  const displayName =
    experience.customer.lineDisplayName ?? experience.customer.displayName;

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
      missionBadgeCount: experience.questBadges.filter((badge) =>
        Boolean(badge.highestEarnedTier),
      ).length,
      missionBadgeTotal: experience.questBadges.length,
    },
    productBadges: experience.recentProductBadges.map((badge) => ({
      id: badge.id,
      title: badge.title,
      imageUrl: badge.imageUrl,
    })),
    missionBadges: experience.recentQuestBadges.map((quest) => ({
      id: quest.highestEarnedTier.id,
      title: quest.title,
      imageUrl: quest.highestEarnedTier.imageUrl,
    })),
    fetchedAt: experience.fetchedAt,
  };
}
