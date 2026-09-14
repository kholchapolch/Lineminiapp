"use client";

import { MyMissionView } from "@/components/my-mission/MyMissionView";
import { PageLoading } from "@/components/page-loading/PageLoading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyMissionDetailData } from "@/lib/my-mission/types";
import { useLineSessionData } from "@/lib/use-line-session-data";
import "./my-mission.css";

type MyMissionPageProps = {
  params: { locale: string; missionId: string };
};

export default function MyMissionPage({
  params,
}: MyMissionPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { data, isLoading } = useLineSessionData<MyMissionDetailData>(
    `/api/my-missions/${encodeURIComponent(params.missionId)}`,
    messages.errors.accessBlocked.message,
  );

  if (isLoading || !data) {
    return <PageLoading variant="my-mission-detail" />;
  }

  return <MyMissionView locale={locale} messages={messages} data={data} />;
}
