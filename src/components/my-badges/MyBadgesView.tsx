import { BadgeCollectionSection } from "@/components/my-badges/BadgeCollectionSection";
import { MyBadgesBottomBar } from "@/components/my-badges/MyBadgesBottomBar";
import { MyBadgesProfileCard } from "@/components/my-badges/MyBadgesHeader";
import { MyBadgesStats } from "@/components/my-badges/MyBadgesStats";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";
import type { MyBadgesData } from "@/lib/my-badges/types";

type MyBadgesViewProps = {
  locale: Locale;
  messages: Messages;
  data: MyBadgesData;
};

export function MyBadgesView({
  locale,
  messages,
  data,
}: MyBadgesViewProps): JSX.Element {
  const { profile, productBadges, missionBadges } = data;

  return (
    <div className="myBadgesPage">
      <main className="myBadgesPage__content">
        <MyBadgesProfileCard profile={profile} />

        <MyBadgesStats
          productBadgeCount={profile.productBadgeCount}
          productBadgeTotal={profile.productBadgeTotal}
          missionBadgeCount={profile.missionBadgeCount}
          missionBadgeTotal={profile.missionBadgeTotal}
          productLabel={messages.myBadges.productBadges}
          missionLabel={messages.myBadges.missionBadges}
        />

        <BadgeCollectionSection
          title={messages.myBadges.myProductBadges}
          viewAllLabel={messages.myBadges.viewAll}
          viewAllHref={localizedPath(locale, "badges")}
          badges={productBadges}
        />

        <BadgeCollectionSection
          title={messages.myBadges.myMissionBadges}
          viewAllLabel={messages.myBadges.viewAll}
          viewAllHref={localizedPath(locale, "badges")}
          badges={missionBadges}
        />
      </main>

      <MyBadgesBottomBar locale={locale} messages={messages} />
    </div>
  );
}
