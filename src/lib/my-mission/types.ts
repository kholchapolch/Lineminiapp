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
