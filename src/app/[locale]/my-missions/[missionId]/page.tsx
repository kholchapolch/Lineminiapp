import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MyMissionView } from "@/components/my-mission/MyMissionView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getMyMissionData } from "@/lib/my-mission/get-my-mission-data";
import { localizedPath } from "@/lib/i18n/paths";
import { getServerLineUuid } from "@/lib/line-session-server";
import "./my-mission.css";

export const dynamic = "force-dynamic";

type MyMissionPageProps = {
  params: { locale: string; missionId: string };
};

export async function generateMetadata({ params }: MyMissionPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.meta.title,
    description: messages.myMission.meta.description,
  };
}

export default async function MyMissionPage({ params }: MyMissionPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const lineuuid = await getServerLineUuid({ allowLocalPreview: true });

  if (!lineuuid) {
    redirect(localizedPath(locale, "badges"));
  }

  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyMissionData(params.missionId, lineuuid),
  ]);

  if (!data) {
    notFound();
  }

  return <MyMissionView locale={locale} messages={messages} data={data} />;
}
