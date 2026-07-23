import type { Locale } from "@/lib/i18n/locales";

export function formatUnlockedDate(isoDate: string, _locale: Locale): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}
