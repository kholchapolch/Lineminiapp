import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MyProductView } from "@/components/my-product/MyProductView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/lib/i18n/locales";
import {
  getMyProductData,
  MY_PRODUCT_REVALIDATE_SECONDS,
} from "@/lib/my-product/get-my-product-data";
import { getMockMyProductIds } from "@/lib/my-product/mock-data";
import "./my-product.css";

export const revalidate = MY_PRODUCT_REVALIDATE_SECONDS;

type MyProductPageProps = {
  params: { locale: string; productId: string };
};

export function generateStaticParams(): Array<{ locale: Locale; productId: string }> {
  return locales.flatMap((locale) =>
    getMockMyProductIds().map((productId) => ({ locale, productId })),
  );
}

export async function generateMetadata({ params }: MyProductPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const data = await getMyProductData(params.productId);

  if (!data) {
    return {};
  }

  const messages = getDictionary(params.locale);

  return {
    title: messages.meta.title,
    description: messages.myProduct.meta.description,
  };
}

export default async function MyProductPage({
  params,
}: MyProductPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const [messages, data] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getMyProductData(params.productId),
  ]);

  if (!data) {
    notFound();
  }

  return <MyProductView locale={locale} messages={messages} data={data} />;
}
