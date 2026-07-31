import { NextResponse } from "next/server";
import {
  getMyProductsData,
  getMyProductsLockedData,
} from "@/lib/my-products/get-my-products-data";
import { toSafeError } from "@/lib/safe-logging";

export async function GET(request: Request): Promise<NextResponse> {
  const lineuuid = new URL(request.url).searchParams.get("lineuuid")?.trim() ?? "";

  try {
    if (!lineuuid) {
      return NextResponse.json(await getMyProductsLockedData());
    }

    return NextResponse.json(await getMyProductsData(lineuuid));
  } catch (error) {
    try {
      return NextResponse.json(await getMyProductsLockedData());
    } catch {
      return NextResponse.json(toSafeError(error), { status: 500 });
    }
  }
}
