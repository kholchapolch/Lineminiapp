"use client";

import { useEffect, useRef, useState } from "react";
import { useLineSession } from "@/components/LineSessionProvider";
import { SonyDataLayerDebug } from "@/components/SonyDataLayerDebug";
import { MyBadgesView } from "@/components/my-badges/MyBadgesView";
import { PageLoading } from "@/components/page-loading/PageLoading";
import { PortalEmptyProductsView } from "@/components/portal/PortalEmptyProductsView";
import { PortalNotLinkedView } from "@/components/portal/PortalNotLinkedView";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type {
  MyBadgesData,
  MyBadgesNoProductsResponse,
  MyBadgesNotLinkedResponse,
} from "@/lib/my-badges/types";
import {
  markSonyDataLayerReady,
  shouldDispatchDataLayerReady,
} from "@/lib/tealium";
import "../../(csr_portal)/portal-layout.css";
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

type AccountGate =
  | { kind: "loading" }
  | { kind: "ready" }
  | {
      kind: "not_linked";
      title: string;
      message: string;
      actionLabel: string;
      actionHref: string;
    }
  | {
      kind: "empty";
      title: string;
      actionLabel: string;
      actionHref: string;
    };

function linkAccountHref(): string {
  return (
    process.env.NEXT_PUBLIC_ACCOUNT_URL?.trim() ||
    process.env.NEXT_PUBLIC_REGISTER_PRODUCT_URL?.trim() ||
    "https://stg.mysony.sony-asia.com/th/line/chooselanguage"
  );
}

function isMyBadgesData(value: unknown): value is MyBadgesData {
  return (
    typeof value === "object" &&
    value !== null &&
    "profile" in value &&
    "productBadges" in value
  );
}

function accountGateFromBadgesResponse(
  locale: Locale,
  portal: ReturnType<typeof getDictionary>["portal"],
  response: Response,
  body: unknown,
): AccountGate {
  if (
    response.status === 404 &&
    typeof body === "object" &&
    body !== null &&
    (body as MyBadgesNotLinkedResponse).accountStatus === "not_linked"
  ) {
    const payload = body as MyBadgesNotLinkedResponse;
    return {
      kind: "not_linked",
      title: payload.placeholder.title[locale] ?? portal.notLinkedTitle,
      message: payload.placeholder.message[locale] ?? "",
      actionLabel: payload.placeholder.action.label[locale],
      actionHref: linkAccountHref(),
    };
  }

  if (
    response.ok &&
    typeof body === "object" &&
    body !== null &&
    (body as MyBadgesNoProductsResponse).productState === "no_products"
  ) {
    const payload = body as MyBadgesNoProductsResponse;
    return {
      kind: "empty",
      title: payload.emptyState.title[locale] ?? portal.emptyTitle,
      actionLabel:
        payload.emptyState.action.label[locale] ??
        portal.registerPage.registerCta,
      actionHref: `/${locale}/portal/register`,
    };
  }

  return { kind: "ready" };
}

export default function MyBadgesPage({
  params,
}: MyBadgesPageProps): JSX.Element {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale);
  const { lineUuid, status } = useLineSession();
  const [data, setData] = useState<MyBadgesData | null>(null);
  const [error, setError] = useState(false);
  const [accountGate, setAccountGate] = useState<AccountGate>({
    kind: "loading",
  });
  const dataLayerReadyDispatched = useRef(false);

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      return;
    }

    if (!lineUuid) {
      setData(null);
      setError(true);
      setAccountGate({ kind: "ready" });
      return;
    }

    const controller = new AbortController();

    setData(null);
    setError(false);
    setAccountGate({ kind: "loading" });

    async function loadBadges() {
      const portalCopy = getDictionary(locale).portal;

      try {
        const response = await fetch(
          `/api/my-badges?locale=${locale}&lineuuid=${lineUuid}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const body: unknown = await response.json();
        setAccountGate(
          accountGateFromBadgesResponse(locale, portalCopy, response, body),
        );

        if (
          response.status === 404 ||
          (response.ok &&
            typeof body === "object" &&
            body !== null &&
            (body as MyBadgesNoProductsResponse).productState === "no_products")
        ) {
          return;
        }

        if (!response.ok || !isMyBadgesData(body)) {
          throw new Error("Failed to load badges");
        }

        setData(body);
        setError(false);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setError(true);
        setAccountGate((current) =>
          current.kind === "loading" ? { kind: "ready" } : current,
        );
      }
    }

    void loadBadges();

    return () => {
      controller.abort();
    };
  }, [lineUuid, locale, status]);

  useEffect(() => {
    if (
      !shouldDispatchDataLayerReady({
        status,
        lineUuid,
        alreadyDispatched: dataLayerReadyDispatched.current,
      })
    ) {
      return;
    }

    dataLayerReadyDispatched.current = true;
    markSonyDataLayerReady(lineUuid ?? "");
  }, [lineUuid, status]);

  let content: JSX.Element;
  if (
    status === "idle" ||
    status === "loading" ||
    accountGate.kind === "loading"
  ) {
    content = <PageLoading variant="my-badges" />;
  } else if (accountGate.kind === "not_linked") {
    content = (
      <div className="portalPage myBadgesPortalGate">
        <PortalNotLinkedView
          title={accountGate.title}
          message={accountGate.message}
          actionLabel={accountGate.actionLabel}
          actionHref={accountGate.actionHref}
        />
      </div>
    );
  } else if (accountGate.kind === "empty") {
    content = (
      <div className="portalPage myBadgesPortalGate">
        <PortalEmptyProductsView
          title={accountGate.title}
          actionLabel={accountGate.actionLabel}
          actionHref={accountGate.actionHref}
        />
      </div>
    );
  } else if (error) {
    content = (
      <MyBadgesView
        locale={locale}
        messages={messages}
        data={EMPTY_MY_BADGES_DATA}
        interactive
      />
    );
  } else if (!lineUuid || !data) {
    content = <PageLoading variant="my-badges" />;
  } else {
    content = <MyBadgesView locale={locale} messages={messages} data={data} />;
  }

  return (
    <>
      {content}
      <SonyDataLayerDebug />
    </>
  );
}
