import { NextResponse } from "next/server";
import { getMyMissionData } from "@/lib/my-mission/get-my-mission-data";
import { toSafeError } from "@/lib/safe-logging";

type MyMissionRouteContext = {
  params: { missionId: string };
};

export async function GET(
  request: Request,
  { params }: MyMissionRouteContext,
): Promise<NextResponse> {
  try {
    const lineuuid = new URL(request.url).searchParams.get("lineuuid") ?? "";
    const data = await getMyMissionData(params.missionId, lineuuid);

    if (!data) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Mission badge not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(toSafeError(error), { status: 500 });
  }
}
