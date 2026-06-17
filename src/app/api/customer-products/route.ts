import { NextResponse } from "next/server";
import { getBadgeResultForLineUuid, isSonyCustomerNotFound } from "@/lib/badge-result";
import { toSafeError } from "@/lib/safe-logging";

function resolveLineUuid(request: Request): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get("lineuuid")?.trim() || null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const lineuuid = resolveLineUuid(request);

  if (!lineuuid) {
    return NextResponse.json(
      {
        code: "MISSING_LINEUUID",
        message: "lineuuid is required.",
      },
      { status: 400 },
    );
  }

  try {
    const payload = await getBadgeResultForLineUuid(lineuuid);
    return NextResponse.json(payload);
  } catch (error) {
    const safeError = toSafeError(error);
    return NextResponse.json(
      safeError,
      { status: isSonyCustomerNotFound(error) ? 404 : 500 },
    );
  }
}
