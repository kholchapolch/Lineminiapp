"use client";

import { MyMissionsView } from "@/components/my-missions/MyMissionsView";
import { PageLoading } from "@/components/page-loading/PageLoading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyMissionsData } from "@/lib/my-missions/types";
import { useLineSessionData } from "@/lib/use-line-session-data";
import "./my-missions.css";

type MyMissionsPageProps = {
  params: { locale: string };
};

export default function MyMissionsPage({
  params,
}: MyMissionsPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { data, isLoading } = useLineSessionData<MyMissionsData>(
    "/api/my-missions",
    messages.errors.accessBlocked.message,
  );

  if (isLoading || !data) {
    return <PageLoading variant="my-missions" />;
  }

  return <MyMissionsView locale={locale} messages={messages} data={data} />;
}
