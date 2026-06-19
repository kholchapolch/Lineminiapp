import { NextResponse } from "next/server";
import { loadAppConfig } from "@/lib/app-config";
import { resolveAuthorizedLineUuid, UnauthorizedError } from "@/lib/auth-session";
import { getBadgeResultForLineUuid, isSonyCustomerNotFound } from "@/lib/badge-result";
import { isDebugTraceEnabled } from "@/lib/debug-mode";
import { toSafeError } from "@/lib/safe-logging";
import type { BadgeApiPayload, BadgeResultPayload } from "@/types/badge";

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
    const payload = await getBadgeResultForLineUuid(lineuuid, {
      config,
      includeDebugTrace,
      cacheHint: {
        customerCacheKey: request.headers.get("x-badge-cache-customer-key") ?? undefined,
        skuHash: request.headers.get("x-badge-cache-sku-hash") ?? undefined,
        rulesVersion: request.headers.get("x-badge-cache-rules-version") ?? undefined,
      },
    });
    return NextResponse.json(toDisplaySafePayload(payload, includeDebugTrace));
  } catch (error) {
    const safeError = toSafeError(error);
    return NextResponse.json(
      safeError,
      { status: error instanceof UnauthorizedError ? 401 : isSonyCustomerNotFound(error) ? 404 : 500 },
    );
  }
}

function toDisplaySafePayload(
  payload: BadgeResultPayload | Extract<BadgeApiPayload, { cacheStatus: "hit" }>,
  includeDebugTrace: boolean,
): BadgeApiPayload {
  if ("cacheStatus" in payload && payload.cacheStatus === "hit") {
    return payload;
  }

  const fullPayload = payload as BadgeResultPayload;

  return {
    cacheStatus: "miss",
    customer: {
      displayName: fullPayload.customer.displayName,
      lineDisplayName: fullPayload.customer.lineDisplayName,
      linePictureUrl: fullPayload.customer.linePictureUrl,
    },
    productCount: fullPayload.products.length,
    supportMessage: fullPayload.supportMessage,
    badges: fullPayload.badges.map((badge) => ({
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
    badgeShelf: fullPayload.badgeShelf,
    cache: fullPayload.cache,
    debugTrace: includeDebugTrace ? fullPayload.debugTrace : undefined,
  };
}
