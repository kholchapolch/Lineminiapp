import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MyMissionView } from "@/components/my-mission/MyMissionView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/lib/i18n/locales";
import { getMyMissionData, MY_MISSION_REVALIDATE_SECONDS } from "@/lib/my-mission/get-my-mission-data";
import { getMockMyMissionIds } from "@/lib/my-mission/mock-data";
import "./my-mission.css";

export const revalidate = MY_MISSION_REVALIDATE_SECONDS;

type MyMissionPageProps = {
  params: { locale: string; missionId: string };
};

export function generateStaticParams(): Array<{ locale: Locale; missionId: string }> {
  return locales.flatMap((locale) =>
    getMockMyMissionIds().map((missionId) => ({ locale, missionId })),
  );
}

export async function generateMetadata({ params }: MyMissionPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const data = await getMyMissionData(params.missionId);

  if (!data) {
    return {};
  }

  const messages = getDictionary(params.locale);
  const sectionMessages = messages.myMissions.sections[data.mission.sectionId];

  return {
    title: `${sectionMessages.title} | ${messages.myMission.meta.title}`,
    description: messages.myMission.meta.description,
  };
}

export default async function MyMissionPage({ params }: MyMissionPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyMissionData(params.missionId),
  ]);

  if (!data) {
    notFound();
  }

  return <MyMissionView locale={locale} messages={messages} data={data} />;
}
