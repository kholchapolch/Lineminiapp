"use client";

import { useEffect, useState } from "react";
import { useLineSession } from "@/components/LineSessionProvider";
import { MyBadgesView } from "@/components/my-badges/MyBadgesView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyBadgesData } from "@/lib/my-badges/types";
import "./my-badges.css";

type MyBadgesPageProps = {
  params: { locale: string };
};

export default function MyBadgesPage({
  params,
}: MyBadgesPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { lineUuid, status } = useLineSession();
  const [data, setData] = useState<MyBadgesData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      return;
    }

    if (!lineUuid) {
      setData(null);
      setError(messages.errors.accessBlocked.message);
      return;
    }

    const controller = new AbortController();

    setData(null);
    setError(null);

    async function loadBadges() {
      try {
        const response = await fetch(
          `/api/my-badges?locale=${locale}&lineuuid=${lineUuid}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(messages.errors.accessBlocked.message);
        }

        setData((await response.json()) as MyBadgesData);
      } catch (cause: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : messages.errors.accessBlocked.message,
        );
      }
    }

    void loadBadges();

    return () => {
      controller.abort();
    };
  }, [lineUuid, locale, messages.errors.accessBlocked.message, status]);

  if (error) {
    return (
      <main className="container">
        <section className="panel" role="alert">
          <h1>{messages.errors.accessBlocked.title}</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (status === "idle" || status === "loading" || !lineUuid || !data) {
    return (
      <main className="container">
        <section className="panel" role="status">
          <h1>{messages.loading.title}</h1>
          <p>{messages.loading.message}</p>
        </section>
      </main>
    );
  }

  return <MyBadgesView locale={locale} messages={messages} data={data} />;
}
