import type { Locale } from "@/lib/i18n/locales";
import { mockMyBadgesByLocale } from "@/lib/my-badges/mock-data";
import type { MyBadgesData } from "@/lib/my-badges/types";

export const MY_BADGES_REVALIDATE_SECONDS = 300;

export async function getMyBadgesData(locale: Locale): Promise<MyBadgesData> {
  const snapshot = mockMyBadgesByLocale[locale];

  return {
    ...snapshot,
    fetchedAt: new Date().toISOString(),
  };
}
