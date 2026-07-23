import { NextResponse } from "next/server";
import {
  getMyMissionData,
  getMyMissionLockedData,
} from "@/lib/my-mission/get-my-mission-data";
import { toSafeError } from "@/lib/safe-logging";

type MyMissionRouteContext = {
  params: { missionId: string };
};

export async function GET(
  request: Request,
  { params }: MyMissionRouteContext,
): Promise<NextResponse> {
  const lineuuid = new URL(request.url).searchParams.get("lineuuid")?.trim() ?? "";

  try {
    const data = lineuuid
      ? await getMyMissionData(params.missionId, lineuuid)
      : await getMyMissionLockedData(params.missionId);

    if (!data) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Mission badge not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    try {
      const locked = await getMyMissionLockedData(params.missionId);

      if (locked) {
        return NextResponse.json(locked);
      }
    } catch {
      // fall through
    }

    return NextResponse.json(toSafeError(error), { status: 500 });
  }
}
