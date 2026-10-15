import { notFound, redirect } from "next/navigation";
import { BadgeClient } from "@/app/badge/BadgeClient";
import { BadgeSessionBootstrap } from "@/app/badge/BadgeSessionBootstrap";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { loadAppConfig } from "@/lib/app-config";
import { resolveBadgeLandingMode } from "@/lib/badge-landing";
import { localizedPath } from "@/lib/i18n/paths";

export const dynamic = "force-dynamic";

type BadgesPageProps = {
  params: { locale: string };
  searchParams?: {
    lineuuid?: string;
    entryError?: string;
    debug?: string;
    mock?: string;
    sku?: string | string[];
  };
};

export default function BadgesPage({ params, searchParams }: BadgesPageProps): JSX.Element {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getDictionary(locale);
  const config = loadAppConfig();
  const landingMode = resolveBadgeLandingMode(config, searchParams?.debug);

  if (
    searchParams?.mock === "1" &&
    config.appEnv === "local" &&
    config.sonyProductApiMode === "mock"
  ) {
    const mockSessionParams = new URLSearchParams({ locale });
    const skuValues = Array.isArray(searchParams.sku)
      ? searchParams.sku
      : searchParams.sku
        ? [searchParams.sku]
        : [];

    for (const sku of skuValues) {
      mockSessionParams.append("sku", sku);
    }

    redirect(`/api/mock-session?${mockSessionParams.toString()}`);
  }

  if (landingMode === "local-preview") {
    redirect(localizedPath(locale, "my-badges"));
  }

  if (landingMode === "line-session") {
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
