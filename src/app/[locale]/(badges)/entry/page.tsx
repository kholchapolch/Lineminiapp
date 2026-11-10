import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { loadAppConfig } from "@/lib/app-config";
import { resolveAuthorizedLineUuid } from "@/lib/auth-session";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/paths";
import { evaluateRedirectGuard } from "@/lib/redirect-guard";

export const dynamic = "force-dynamic";

type EntryPageProps = {
  params: { locale: string };
};

export default function EntryPage({ params }: EntryPageProps): never {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const config = loadAppConfig();
  const requestHeaders = headers();
  const guard = evaluateRedirectGuard(requestHeaders, config);

  if (!guard.allowed) {
    redirect(localizedPath(locale, "badges", { entryError: guard.reason }));
  }

  try {
    resolveAuthorizedLineUuid({
      config,
      headers: requestHeaders,
    });
  } catch {
    redirect(localizedPath(locale, "badges", { entryError: "missingLineSession" }));
  }

  redirect(localizedPath(locale, "badges"));
}
