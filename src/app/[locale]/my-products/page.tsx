"use client";

import { MyProductsClient } from "@/components/my-products/MyProductsClient";
import { PageError } from "@/components/page-error/PageError";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyProductsData } from "@/lib/my-products/types";
import { useLineSessionData } from "@/lib/use-line-session-data";
import "./my-products.css";
import { PageLoading } from "@/components/page-loading/PageLoading";

type MyProductsPageProps = {
  params: { locale: string };
};

export default function MyProductsPage({
  params,
}: MyProductsPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { data, error } = useLineSessionData<MyProductsData>(
    "/api/my-products",
    messages.errors.accessBlocked.message,
  );

  if (error) {
    return (
      <PageError title={messages.errors.accessBlocked.title} message={error} />
    );
  }

  if (!data) {
    return <PageLoading variant="my-products" />;
  }

  return <MyProductsClient locale={locale} messages={messages} data={data} />;
}
