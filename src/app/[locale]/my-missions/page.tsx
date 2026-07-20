import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MyMissionsView } from "@/components/my-missions/MyMissionsView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getMyMissionsData } from "@/lib/my-missions/get-my-missions-data";
import { localizedPath } from "@/lib/i18n/paths";
import { getServerLineUuid } from "@/lib/line-session-server";
import "./my-missions.css";

export const dynamic = "force-dynamic";

type MyMissionsPageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: MyMissionsPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.meta.title,
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
  const lineuuid = await getServerLineUuid({ allowLocalPreview: true });

  if (!lineuuid) {
    redirect(localizedPath(locale, "badges"));
  }

  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyMissionsData(lineuuid),
  ]);

  return <MyMissionsView locale={locale} messages={messages} data={data} />;
}
