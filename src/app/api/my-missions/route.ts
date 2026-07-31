import { NextResponse } from "next/server";
import {
  getMyMissionsData,
  getMyMissionsLockedData,
} from "@/lib/my-missions/get-my-missions-data";
import { toSafeError } from "@/lib/safe-logging";

export async function GET(request: Request): Promise<NextResponse> {
  const lineuuid = new URL(request.url).searchParams.get("lineuuid")?.trim() ?? "";

  try {
    if (!lineuuid) {
      return NextResponse.json(await getMyMissionsLockedData());
    }

    return NextResponse.json(await getMyMissionsData(lineuuid));
  } catch (error) {
    try {
      return NextResponse.json(await getMyMissionsLockedData());
    } catch {
      return NextResponse.json(toSafeError(error), { status: 500 });
    }
  }
}
