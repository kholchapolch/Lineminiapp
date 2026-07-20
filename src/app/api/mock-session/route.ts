import { NextResponse } from "next/server";
import { createLineSessionCookie } from "@/lib/auth-session";
import { loadAppConfig } from "@/lib/app-config";
import { defaultLocale, isLocale } from "@/lib/i18n/locales";
import { createMockSkuLineUuid, parseMockSkuValues } from "@/lib/sku-mock";

export async function GET(request: Request): Promise<NextResponse> {
  const config = loadAppConfig();

  if (config.appEnv !== "local" || config.sonyProductApiMode !== "mock") {
    return NextResponse.json({ code: "NOT_FOUND", message: "Not found." }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const skus = parseMockSkuValues(requestUrl.searchParams.getAll("sku"));

  if (skus.length === 0) {
    return NextResponse.json(
      { code: "MISSING_SKU", message: "At least one SKU is required." },
      { status: 400 },
    );
  }

  const requestedLocale = requestUrl.searchParams.get("locale") ?? "";
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const response = NextResponse.redirect(new URL(`/${locale}/my-badges`, request.url));
  response.headers.append(
    "set-cookie",
    createLineSessionCookie({ config, lineuuid: createMockSkuLineUuid(skus) }),
  );
  return response;
}
