import { NextResponse } from "next/server";
import type { AppEnv } from "@/lib/app-config";
import { getBadgeResultForLineUuid, isSonyCustomerNotFound } from "@/lib/badge-result";
import { isDebugTraceEnabled } from "@/lib/debug-mode";
import { toSafeError } from "@/lib/safe-logging";

function getSearchParams(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}

function resolveLineUuid(searchParams: URLSearchParams): string | null {
  return searchParams.get("lineuuid")?.trim() || null;
}

function resolveAppEnv(value: string | undefined): AppEnv {
  return value === "staging" || value === "production" ? value : "local";
}

export async function GET(request: Request): Promise<NextResponse> {
  const searchParams = getSearchParams(request);
  const lineuuid = resolveLineUuid(searchParams);

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
    const includeDebugTrace = isDebugTraceEnabled({
      appEnv: resolveAppEnv(process.env.APP_ENV),
      debugParam: searchParams.get("debug"),
    });
    const payload = await getBadgeResultForLineUuid(lineuuid, { includeDebugTrace });
    return NextResponse.json(payload);
  } catch (error) {
    const safeError = toSafeError(error);
    return NextResponse.json(
      safeError,
      { status: isSonyCustomerNotFound(error) ? 404 : 500 },
    );
  }
}
