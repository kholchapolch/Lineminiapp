import { mockMyMissionDetails } from "@/lib/my-mission/mock-data";
import type { MyMissionDetailData } from "@/lib/my-mission/types";

export const MY_MISSION_REVALIDATE_SECONDS = 300;

export async function getMyMissionData(missionId: string): Promise<MyMissionDetailData | null> {
  const mission = mockMyMissionDetails.get(missionId);

  if (!mission) {
    return null;
  }

  return {
    mission,
    fetchedAt: new Date().toISOString(),
  };
}
