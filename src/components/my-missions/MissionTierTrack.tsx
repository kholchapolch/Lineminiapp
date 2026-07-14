import Link from "next/link";
/* eslint-disable @next/next/no-img-element -- Mission badge images come from mock/page data. */
import type { Locale } from "@/lib/i18n/locales";
import { localizedMissionPath } from "@/lib/i18n/paths";
import type { MissionTier } from "@/lib/my-missions/types";

type MissionTierTrackProps = {
  locale: Locale;
  tiers: MissionTier[];
};

export function MissionTierTrack({ locale, tiers }: MissionTierTrackProps): JSX.Element {
  return (
    <div className="missionTierTrack">
      {tiers.map((tier) => (
        <Link
          className={`missionBadgeNode missionBadgeNode--${tier.status}`}
          href={localizedMissionPath(locale, tier.id)}
          key={tier.id}
        >
          <div className="missionBadgeNode__art">
            <img src={tier.imageUrl} alt="" />
          </div>
          <p className="missionBadgeNode__progress">
            {tier.progress}/{tier.target}
          </p>
        </Link>
      ))}
    </div>
  );
}
