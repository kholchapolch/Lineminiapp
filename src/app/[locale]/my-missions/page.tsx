"use client";

import { MyMissionsView } from "@/components/my-missions/MyMissionsView";
import { PageError } from "@/components/page-error/PageError";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyMissionsData } from "@/lib/my-missions/types";
import { useLineSessionData } from "@/lib/use-line-session-data";
import "./my-missions.css";

type MyMissionsPageProps = {
  params: { locale: string };
};

export default function MyMissionsPage({
  params,
}: MyMissionsPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { data, error } = useLineSessionData<MyMissionsData>(
    "/api/my-missions",
    messages.errors.accessBlocked.message,
  );

  if (error) {
    return (
      <PageError
        title={messages.errors.accessBlocked.title}
        message={error}
      />
    );
  }

  if (!data) {
    return (
      <main className="container">
        <section className="panel" role="status">
          <h1>{messages.loading.title}</h1>
          <p>{messages.loading.message}</p>
        </section>
      </main>
    );
  }

  return <MyMissionsView locale={locale} messages={messages} data={data} />;
}
