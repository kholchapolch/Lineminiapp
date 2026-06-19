import { NextResponse } from "next/server";
import { loadAppConfig } from "@/lib/app-config";
import { resolveAuthorizedLineUuid, UnauthorizedError } from "@/lib/auth-session";
import { getBadgeResultForLineUuid, isSonyCustomerNotFound } from "@/lib/badge-result";
import { isDebugTraceEnabled } from "@/lib/debug-mode";
import { toSafeError } from "@/lib/safe-logging";
import type { BadgeResultPayload } from "@/types/badge";

function getSearchParams(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}

export async function GET(request: Request): Promise<NextResponse> {
  const searchParams = getSearchParams(request);

  try {
    const config = loadAppConfig();
    const lineuuid = resolveAuthorizedLineUuid({
      config,
      headers: request.headers,
      providedLineUuid: searchParams.get("lineuuid"),
    });
    const includeDebugTrace = isDebugTraceEnabled({
      appEnv: config.appEnv,
      debugParam: searchParams.get("debug"),
    });
    const payload = await getBadgeResultForLineUuid(lineuuid, { config, includeDebugTrace });
    return NextResponse.json(toDisplaySafePayload(payload, includeDebugTrace));
  } catch (error) {
    const safeError = toSafeError(error);
    return NextResponse.json(
      safeError,
      { status: error instanceof UnauthorizedError ? 401 : isSonyCustomerNotFound(error) ? 404 : 500 },
    );
  }
}

function toDisplaySafePayload(payload: BadgeResultPayload, includeDebugTrace: boolean) {
  return {
    customer: {
      displayName: payload.customer.displayName,
      lineDisplayName: payload.customer.lineDisplayName,
      linePictureUrl: payload.customer.linePictureUrl,
    },
    productCount: payload.products.length,
    supportMessage: payload.supportMessage,
    badges: payload.badges.map((badge) => ({
      code: badge.code,
      name: badge.name,
      type: badge.type,
      description: badge.description,
      status: badge.status,
      progress: badge.progress,
      remainingCount: badge.remainingCount,
      matchedCount: badge.matchedCount,
      requiredCount: badge.requiredCount,
      imageUrl: badge.imageUrl,
      level: badge.level ?? null,
    })),
    badgeShelf: payload.badgeShelf,
    debugTrace: includeDebugTrace ? payload.debugTrace : undefined,
  };
}
