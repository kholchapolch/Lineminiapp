"use client";

import { MyProductView } from "@/components/my-product/MyProductView";
import { PageError } from "@/components/page-error/PageError";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyProductDetailData } from "@/lib/my-product/types";
import { useLineSessionData } from "@/lib/use-line-session-data";
import "./my-product.css";
import { PageLoading } from "@/components/page-loading/PageLoading";

type MyProductPageProps = {
  params: { locale: string; productId: string };
};

export default function MyProductPage({
  params,
}: MyProductPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { data, error } = useLineSessionData<MyProductDetailData>(
    `/api/my-products/${encodeURIComponent(params.productId)}`,
    messages.errors.accessBlocked.message,
  );

  if (error) {
    return (
      <PageError title={messages.errors.accessBlocked.title} message={error} />
    );
  }

  if (!data) {
    return <PageLoading variant="my-product-detail" />;
  }

  return <MyProductView locale={locale} messages={messages} data={data} />;
}
