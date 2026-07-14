import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MyProductsClient } from "@/components/my-products/MyProductsClient";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import {
  getMyProductsData,
  MY_PRODUCTS_REVALIDATE_SECONDS,
} from "@/lib/my-products/get-my-products-data";
import "./my-products.css";

export const revalidate = MY_PRODUCTS_REVALIDATE_SECONDS;

type MyProductsPageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: MyProductsPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.meta.title,
    description: messages.myProducts.meta.description,
  };
}

export default async function MyProductsPage({
  params,
}: MyProductsPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyProductsData(),
  ]);

  return <MyProductsClient locale={locale} messages={messages} data={data} />;
}
