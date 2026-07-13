import type { Locale } from "@/lib/i18n/locales";
import type { MyBadgesData } from "@/lib/my-badges/types";

const MOCK_AVATAR = "/mock/my-badges/avatar.svg";
const PRODUCT_BADGE_LENS = "/mock/my-badges/product-lens.svg";
const PRODUCT_BADGE_WIDE = "/mock/my-badges/product-wide.svg";
const MISSION_PORTRAIT = "/mock/my-badges/mission-portrait.svg";
const MISSION_WIDE = "/mock/my-badges/mission-wide.svg";

const sharedProfile = {
  channelName: "sony-thailand",
  displayName: "Katty Robin",
  handle: "@katty_sony_enthusiast",
  avatarUrl: MOCK_AVATAR,
  isVerified: true,
  isOnline: true,
  productBadgeCount: 2,
  productBadgeTotal: 99,
  missionBadgeCount: 2,
  missionBadgeTotal: 7,
} as const;

export const mockMyBadgesByLocale: Record<Locale, Omit<MyBadgesData, "fetchedAt">> = {
  th: {
    profile: { ...sharedProfile },
    productBadges: [
      { id: "sel70200gm", title: "SEL70200GM", imageUrl: PRODUCT_BADGE_LENS },
      { id: "sel1224gm", title: "SEL1224GM", imageUrl: PRODUCT_BADGE_WIDE },
    ],
    missionBadges: [
      { id: "portrait-master", title: "Portrait Master", imageUrl: MISSION_PORTRAIT },
      { id: "wide-architect", title: "Wide Architect", imageUrl: MISSION_WIDE },
    ],
  },
  en: {
    profile: { ...sharedProfile },
    productBadges: [
      { id: "sel70200gm", title: "SEL70200GM", imageUrl: PRODUCT_BADGE_LENS },
      { id: "sel1224gm", title: "SEL1224GM", imageUrl: PRODUCT_BADGE_WIDE },
    ],
    missionBadges: [
      { id: "portrait-master", title: "Portrait Master", imageUrl: MISSION_PORTRAIT },
      { id: "wide-architect", title: "Wide Architect", imageUrl: MISSION_WIDE },
    ],
  },
};
