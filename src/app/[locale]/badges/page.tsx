import { notFound } from "next/navigation";
import { BadgeClient } from "@/app/badge/BadgeClient";
import { BadgeSessionBootstrap } from "@/app/badge/BadgeSessionBootstrap";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

type BadgesPageProps = {
  params: { locale: string };
  searchParams?: { lineuuid?: string; entryError?: string; debug?: string };
};

export default function BadgesPage({ params, searchParams }: BadgesPageProps): JSX.Element {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getDictionary(locale);

  if (searchParams?.debug !== "1") {
    return (
      <BadgeSessionBootstrap
        locale={locale}
        messages={messages}
        entryError={searchParams?.entryError}
      />
    );
  }

  return (
    <BadgeClient
      locale={locale}
      messages={messages}
      lineuuid={searchParams?.lineuuid}
      debug={searchParams?.debug}
      entryError={searchParams?.entryError}
    />
  );
}
