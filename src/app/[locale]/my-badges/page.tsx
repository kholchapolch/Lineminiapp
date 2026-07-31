"use client";

import { useEffect, useState } from "react";
import { useLineSession } from "@/components/LineSessionProvider";
import { MyBadgesView } from "@/components/my-badges/MyBadgesView";
import { PageLoading } from "@/components/page-loading/PageLoading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { MyBadgesData } from "@/lib/my-badges/types";
import "./my-badges.css";

type MyBadgesPageProps = {
  params: { locale: string };
};

const EMPTY_MY_BADGES_DATA: MyBadgesData = {
  profile: {
    channelName: "",
    lineDisplayName: "",
    linePictureUrl: null,
    handle: "",
    isVerified: false,
    isOnline: false,
    productBadgeCount: 0,
    productBadgeTotal: 0,
    missionBadgeCount: 0,
    missionBadgeTotal: 0,
  },
  productBadges: [],
  missionBadges: [],
  fetchedAt: "",
};

export default function MyBadgesPage({
  params,
}: MyBadgesPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { lineUuid, status } = useLineSession();
  const [data, setData] = useState<MyBadgesData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      return;
    }

    if (!lineUuid) {
      setData(null);
      setError(true);
      return;
    }

    const controller = new AbortController();

    setData(null);
    setError(false);

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
          throw new Error("Failed to load badges");
        }

        setData((await response.json()) as MyBadgesData);
        setError(false);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setError(true);
      }
    }

    void loadBadges();

    return () => {
      controller.abort();
    };
  }, [lineUuid, locale, status]);

  if (status === "idle" || status === "loading") {
    return <PageLoading variant="my-badges" />;
  }

  if (error) {
    return (
      <MyBadgesView
        locale={locale}
        messages={messages}
        data={EMPTY_MY_BADGES_DATA}
        interactive
      />
    );
  }

  if (!lineUuid || !data) {
    return <PageLoading variant="my-badges" />;
  }

  return <MyBadgesView locale={locale} messages={messages} data={data} />;
}
