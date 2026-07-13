/* eslint-disable @next/next/no-img-element -- Mission badge images come from mock/page data. */
import type { MissionTier } from "@/lib/my-missions/types";

type MissionTierTrackProps = {
  tiers: MissionTier[];
};

export function MissionTierTrack({ tiers }: MissionTierTrackProps): JSX.Element {
  return (
    <div className="missionTierTrack">
      {tiers.map((tier) => (
        <article
          className={`missionBadgeNode missionBadgeNode--${tier.status}`}
          key={tier.id}
        >
          <div className="missionBadgeNode__art">
            <img src={tier.imageUrl} alt="" />
          </div>
          <p className="missionBadgeNode__progress">
            {tier.progress}/{tier.target}
          </p>
        </article>
      ))}
    </div>
  );
}
