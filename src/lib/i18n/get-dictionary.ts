import { en } from "@/lib/i18n/messages/en";
import { th } from "@/lib/i18n/messages/th";
import type { Messages } from "@/lib/i18n/messages/types";
import type { Locale } from "@/lib/i18n/locales";

const dictionaries: Record<Locale, Messages> = {
  th,
  en,
};

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}
