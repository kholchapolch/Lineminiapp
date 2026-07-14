import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LineSessionProvider } from "@/components/LineSessionProvider";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/lib/i18n/locales";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps): JSX.Element {
  if (!isLocale(params.locale)) {
    notFound();
  }

  return <LineSessionProvider>{children}</LineSessionProvider>;
}
