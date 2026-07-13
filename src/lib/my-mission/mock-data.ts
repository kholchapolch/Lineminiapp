import { mockMyMissionsCatalog } from "@/lib/my-missions/mock-data";
import type { MyMissionDetail, MissionTicket } from "@/lib/my-mission/types";

const TICKET_IMAGE = "/mock/my-badges/product-lens.svg";

const UNLOCKED_AT_BY_MISSION: Partial<Record<string, string>> = {
  "portrait-master-tier-1": "2025-12-20T00:00:00.000Z",
  "wide-architect-tier-1": "2025-12-18T00:00:00.000Z",
};

function buildTickets(missionId: string, completedCount: number): MissionTicket[] {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `${missionId}-ticket-${index + 1}`,
    productCode: "xxxxxxx",
    imageUrl: TICKET_IMAGE,
    status: index < completedCount ? "completed" : "pending",
  }));
}

function buildMissionDetails(): MyMissionDetail[] {
  return mockMyMissionsCatalog.sections.flatMap((section) =>
    section.tiers.map((tier) => ({
      id: tier.id,
      sectionId: section.id,
      badgeImageUrl: tier.imageUrl,
      progress: tier.progress,
      target: tier.target,
      unlockedAt: UNLOCKED_AT_BY_MISSION[tier.id],
      tickets: buildTickets(tier.id, tier.progress),
    })),
  );
}

export const mockMyMissionDetails = new Map(
  buildMissionDetails().map((mission) => [mission.id, mission] as const),
);

export function getMockMyMissionIds(): string[] {
  return [...mockMyMissionDetails.keys()];
}
