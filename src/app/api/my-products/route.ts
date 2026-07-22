import { NextResponse } from "next/server";
import { getMyProductsData } from "@/lib/my-products/get-my-products-data";
import { toSafeError } from "@/lib/safe-logging";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const lineuuid = new URL(request.url).searchParams.get("lineuuid") ?? "";
    const data = await getMyProductsData(lineuuid);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(toSafeError(error), { status: 500 });
  }
}
