import { defaultLocale, type Locale } from "@/lib/i18n/locales";

export type LocalizedRoute = "badges" | "entry" | "my-badges" | "my-products" | "my-missions";

export function localizedPath(
  locale: Locale,
  route: LocalizedRoute,
  searchParams?: Record<string, string | undefined>,
): string {
  const path = `/${locale}/${route}`;
  const params = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function localizedProductPath(locale: Locale, productId: string): string {
  return `/${locale}/my-product/${productId}`;
}

export function defaultBadgesPath(searchParams?: Record<string, string | undefined>): string {
  return localizedPath(defaultLocale, "badges", searchParams);
}

export function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${nextLocale}/badges`;
  }

  segments[0] = nextLocale;
  return `/${segments.join("/")}`;
}
