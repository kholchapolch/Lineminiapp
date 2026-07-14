import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MyBadgesView } from "@/components/my-badges/MyBadgesView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import {
  getMyBadgesData,
  MY_BADGES_REVALIDATE_SECONDS,
} from "@/lib/my-badges/get-my-badges-data";
import "./my-badges.css";

export const revalidate = MY_BADGES_REVALIDATE_SECONDS;

type MyBadgesPageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: MyBadgesPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.meta.title,
    description: messages.myBadges.meta.description,
  };
}

export default async function MyBadgesPage({ params }: MyBadgesPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyBadgesData(locale),
  ]);

  return <MyBadgesView locale={locale} messages={messages} data={data} />;
}
