import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/locales";

const LOCALE_HEADER = "x-locale";
const MY_BADGES_PATH = "/my-badges";

function withLocaleHeader(
  response: NextResponse,
  locale: string,
): NextResponse {
  response.headers.set(LOCALE_HEADER, locale);
  return response;
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const locale = pathname.split("/").filter(Boolean)[0] ?? defaultLocale;
  return withLocaleHeader(NextResponse.redirect(url), locale);
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return redirectTo(request, `/${defaultLocale}${MY_BADGES_PATH}`);
  }

  if (pathname === "/badge" || pathname === "/badge/") {
    return redirectTo(request, `/${defaultLocale}/badges`);
  }

  if (
    pathname === MY_BADGES_PATH ||
    pathname.startsWith(`${MY_BADGES_PATH}/`)
  ) {
    const suffix = pathname.slice(MY_BADGES_PATH.length);
    const target = `/${defaultLocale}${MY_BADGES_PATH}${suffix === "/" ? "" : suffix}`;
    return redirectTo(request, target);
  }

  if (pathname === "/entry" || pathname.startsWith("/entry/")) {
    const suffix = pathname.slice("/entry".length);
    const target = `/${defaultLocale}/entry${suffix === "/" ? "" : suffix}`;
    return redirectTo(request, target);
  }

  const [, localeSegment] = pathname.split("/");

  if (!localeSegment || !isLocale(localeSegment)) {
    return withLocaleHeader(NextResponse.next(), defaultLocale);
  }

  return withLocaleHeader(NextResponse.next(), localeSegment);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|docs).*)"],
};
