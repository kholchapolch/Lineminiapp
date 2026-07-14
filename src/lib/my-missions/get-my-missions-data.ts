import { mockMyMissionsCatalog } from "@/lib/my-missions/mock-data";
import type { MyMissionsData } from "@/lib/my-missions/types";

export const MY_MISSIONS_REVALIDATE_SECONDS = 300;

export async function getMyMissionsData(): Promise<MyMissionsData> {
  return {
    ...mockMyMissionsCatalog,
    fetchedAt: new Date().toISOString(),
  };
}
