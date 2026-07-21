import { NextResponse } from "next/server";
import { loadAppConfig } from "@/lib/app-config";
import {
  resolveAuthorizedLineUuid,
  UnauthorizedError,
} from "@/lib/auth-session";
import { defaultLocale, isLocale } from "@/lib/i18n/locales";
import { getMyBadgesData } from "@/lib/my-badges/get-my-badges-data";
import { toSafeError } from "@/lib/safe-logging";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const searchParams = new URL(request.url).searchParams;
    const requestedLocale = searchParams.get("locale") ?? "";
    const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
    const lineuuid = searchParams.get("lineuuid") ?? "";

    console.log({ locale, lineuuid });

    const data = await getMyBadgesData(locale, lineuuid);

    return NextResponse.json(data);
  } catch (error) {
    const safeError = toSafeError(error);

    console.log({ safeError });

    return NextResponse.json(safeError, {
      status: error instanceof UnauthorizedError ? 401 : 500,
    });
  }
}
