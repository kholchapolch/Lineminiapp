import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MyMissionsView } from "@/components/my-missions/MyMissionsView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import {
  getMyMissionsData,
  MY_MISSIONS_REVALIDATE_SECONDS,
} from "@/lib/my-missions/get-my-missions-data";
import "./my-missions.css";

export const revalidate = MY_MISSIONS_REVALIDATE_SECONDS;

type MyMissionsPageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: MyMissionsPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.myMissions.meta.title,
    description: messages.myMissions.meta.description,
  };
}

export default async function MyMissionsPage({
  params,
}: MyMissionsPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyMissionsData(),
  ]);

  return <MyMissionsView locale={locale} messages={messages} data={data} />;
}
