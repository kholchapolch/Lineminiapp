import { MissionTierTrack } from "@/components/my-missions/MissionTierTrack";
import type { Locale } from "@/lib/i18n/locales";
import type { MissionSection as MissionSectionData } from "@/lib/my-missions/types";

type MissionSectionProps = {
  locale: Locale;
  section: MissionSectionData;
  title: string;
  description: string;
  showTopEdge?: boolean;
  showBottomEdge?: boolean;
};

export function MissionSection({
  locale,
  section,
  title,
  description,
  showTopEdge = false,
  showBottomEdge = false,
}: MissionSectionProps): JSX.Element {
  return (
    <section className="missionSection">
      {showTopEdge ? (
        <div className="missionSection__edge missionSection__edge--top" aria-hidden="true" />
      ) : null}
      <div className="missionSection__content">
        <h2>{title}</h2>
        <p>{description}</p>
        <MissionTierTrack locale={locale} tiers={section.tiers} />
      </div>
      {showBottomEdge ? (
        <div className="missionSection__edge missionSection__edge--bottom" aria-hidden="true" />
      ) : null}
    </section>
  );
}
