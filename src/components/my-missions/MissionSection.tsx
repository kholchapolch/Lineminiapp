import { MissionTierTrack } from "@/components/my-missions/MissionTierTrack";
import type { MissionSection as MissionSectionData } from "@/lib/my-missions/types";

type MissionSectionProps = {
  section: MissionSectionData;
  title: string;
  description: string;
};

export function MissionSection({
  section,
  title,
  description,
}: MissionSectionProps): JSX.Element {
  return (
    <section className="missionSection">
      <div className="missionSection__divider missionSection__divider--top" aria-hidden="true" />
      <div className="missionSection__content">
        <h2>{title}</h2>
        <p>{description}</p>
        <MissionTierTrack tiers={section.tiers} />
      </div>
      <div className="missionSection__divider missionSection__divider--bottom" aria-hidden="true" />
    </section>
  );
}
