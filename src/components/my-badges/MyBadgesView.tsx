import { BadgeCollectionSection } from "@/components/my-badges/BadgeCollectionSection";
import { MyBadgesBottomBar } from "@/components/my-badges/MyBadgesBottomBar";
import { MyBadgesProfileCard } from "@/components/my-badges/MyBadgesHeader";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedMissionPath, localizedPath, localizedProductPath } from "@/lib/i18n/paths";
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

        <BadgeCollectionSection
          title={messages.myBadges.myProductBadges}
          viewAllLabel={messages.myBadges.viewAll}
          viewAllHref={localizedPath(locale, "my-products")}
          badges={productBadges}
          getBadgeHref={(badgeId) => localizedProductPath(locale, badgeId)}
        />

        <BadgeCollectionSection
          title={messages.myBadges.myMissionBadges}
          viewAllLabel={messages.myBadges.viewAll}
          viewAllHref={localizedPath(locale, "my-missions")}
          badges={missionBadges}
          getBadgeHref={(badgeId) => localizedMissionPath(locale, badgeId)}
        />
      </main>

      <MyBadgesBottomBar locale={locale} messages={messages} />
    </div>
  );
}
