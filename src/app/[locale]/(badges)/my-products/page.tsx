"use client";

import { MyProductsClient } from "@/components/my-products/MyProductsClient";
import { PageLoading } from "@/components/page-loading/PageLoading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyProductsData } from "@/lib/my-products/types";
import { useLineSessionData } from "@/lib/use-line-session-data";
import "./my-products.css";

type MyProductsPageProps = {
  params: { locale: string };
};

export default function MyProductsPage({
  params,
}: MyProductsPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { data, isLoading } = useLineSessionData<MyProductsData>(
    "/api/my-products",
    messages.errors.accessBlocked.message,
  );

  if (isLoading || !data) {
    return <PageLoading variant="my-products" />;
  }

  return <MyProductsClient locale={locale} messages={messages} data={data} />;
}
