import { NextResponse } from "next/server";
import { getMyMissionsData } from "@/lib/my-missions/get-my-missions-data";
import { toSafeError } from "@/lib/safe-logging";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const lineuuid = new URL(request.url).searchParams.get("lineuuid") ?? "";
    const data = await getMyMissionsData(lineuuid);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(toSafeError(error), { status: 500 });
  }
}
