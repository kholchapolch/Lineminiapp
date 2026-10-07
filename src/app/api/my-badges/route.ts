import { NextResponse } from "next/server";
import { loadAppConfig } from "@/lib/app-config";
import {
  resolveAuthorizedLineUuid,
  UnauthorizedError,
} from "@/lib/auth-session";
import { defaultLocale, isLocale } from "@/lib/i18n/locales";
import { loadMyBadgesPageData } from "@/lib/my-badges/get-my-badges-data";
import { toSafeError } from "@/lib/safe-logging";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const searchParams = new URL(request.url).searchParams;
    const requestedLocale = searchParams.get("locale") ?? "";
    const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
    const config = loadAppConfig();
    const lineuuid = resolveAuthorizedLineUuid({
      config,
      headers: request.headers,
      providedLineUuid: searchParams.get("lineuuid"),
    });
    const result = await loadMyBadgesPageData(locale, lineuuid);

    if (result.kind === "not_linked") {
      return NextResponse.json(
        {
          accountStatus: "not_linked",
          placeholder: result.placeholder,
        },
        { status: 404 },
      );
    }

    if (result.kind === "no_products") {
      return NextResponse.json({
        accountStatus: "linked",
        productState: "no_products",
        emptyState: result.emptyState,
      });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const safeError = toSafeError(error);

    return NextResponse.json(safeError, {
      status: error instanceof UnauthorizedError ? 401 : 500,
    });
  }
}
