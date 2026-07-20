"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createLineSessionFromCurrentLiff } from "@/lib/liff-session";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";

type BadgeSessionBootstrapProps = {
  locale: Locale;
  messages: Messages;
  entryError?: string;
};

export function BadgeSessionBootstrap({
  locale,
  messages,
  entryError,
}: BadgeSessionBootstrapProps): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    entryError ? messages.errors.accessBlocked.message : null,
  );

  useEffect(() => {
    if (entryError) return;

    let active = true;

    createLineSessionFromCurrentLiff()
      .then(() => {
        if (active) router.replace(localizedPath(locale, "my-badges"));
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : messages.errors.accessBlocked.message);
        }
      });

    return () => {
      active = false;
    };
  }, [entryError, locale, messages.errors.accessBlocked.message, router]);

  return (
    <main className="container">
      <section className="panel" role={error ? "alert" : "status"}>
        <h1>{error ? messages.errors.accessBlocked.title : messages.loading.title}</h1>
        <p>{error ?? messages.loading.message}</p>
      </section>
    </main>
  );
}
