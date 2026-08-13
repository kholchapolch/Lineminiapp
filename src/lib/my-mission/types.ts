import type { MissionSectionId } from "@/lib/my-missions/types";

export type MissionTicketStatus = "completed" | "pending";

export type MissionTicket = {
  id: string;
  /** Eligible SKU from badge_rule_conditions.sony_skus */
  productCode: string;
  /** badge_rules.badge_name / product badge display title */
  title: string;
  imageUrl: string;
  status: MissionTicketStatus;
  productUrl: string | null;
};

export type MyMissionDetail = {
  id: string;
  sectionId: MissionSectionId;
  /** bronze | silver | gold for multi-tier quests; null for single-level */
  level: string | null;
  /** badge_rule_thresholds.display_name */
  tierTitle: string;
  /** Number of tiers in this quest section */
  tierCount: number;
  badgeImageUrl: string;
  shareImageUrl: string;
  progress: number;
  target: number;
  unlockedAt?: string;
  tickets: MissionTicket[];
};

export type MyMissionDetailData = {
  mission: MyMissionDetail;
  fetchedAt: string;
};

export function isMissionComplete(mission: Pick<MyMissionDetail, "progress" | "target">): boolean {
  return mission.progress >= mission.target;
}

/** Card title: level label when multi-tier, otherwise section title. */
export function resolveMissionCardTitle(
  mission: Pick<MyMissionDetail, "tierCount" | "level" | "tierTitle">,
  sectionTitle: string,
  levelLabels: Partial<Record<string, string>>,
): string {
  if (mission.tierCount <= 1) {
    return sectionTitle;
  }

  if (mission.level) {
    const labeled = levelLabels[mission.level]?.trim();
    if (labeled) {
      return labeled;
    }
  }

  return mission.tierTitle.trim() || sectionTitle;
}
