"use client";

import { useEffect, useState } from "react";
import {
  createLineSessionFromCurrentLiff,
  getCurrentLiffClient,
} from "@/lib/liff-session";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";

type LiffState =
  | { status: "loading"; message: string }
  | { status: "mock"; message: string }
  | { status: "ready"; message: string; lineUuid?: string }
  | { status: "unsupported"; message: string }
  | { status: "error"; message: string };

type LiffStatusProps = {
  locale: Locale;
  messages: Messages;
};

export function LiffStatus({ locale, messages }: LiffStatusProps): JSX.Element {
  const [state, setState] = useState<LiffState>({
    status: "loading",
    message: messages.liff.checkingSession,
  });

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      setState({
        status: "mock",
        message: messages.liff.mockMode,
      });
      return;
    }

    let active = true;

    setState({
      status: "loading",
      message: messages.liff.initializing,
    });

    async function initLiff() {
      try {
        const liff = await getCurrentLiffClient();

        if (!active) {
          return;
        }

        const isInClient = liff.isInClient();
        const profile =
          isInClient && liff.getProfile ? await liff.getProfile() : undefined;

        setState({
          status: "ready",
          message: messages.liff.runningInLine,
          lineUuid: profile?.userId,
        });
      } catch {
        if (!active) {
          return;
        }

        setState({
          status: "error",
          message: messages.liff.initError,
        });
      }
    }

    void initLiff();

    return () => {
      active = false;
    };
  }, [messages.liff]);

  return (
    <div className={`liffStatus ${state.status}`} aria-live="polite">
      <p>{state.message}</p>
      {state.status === "ready" && state.lineUuid ? (
        <LineSessionButton locale={locale} messages={messages} />
      ) : null}
    </div>
  );
}

function LineSessionButton({
  locale,
  messages,
}: {
  locale: Locale;
  messages: Messages;
}): JSX.Element {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueToBadge() {
    setBusy(true);
    setError(null);

    try {
      await createLineSessionFromCurrentLiff();
      window.location.assign(localizedPath(locale, "entry"));
    } catch {
      setError(messages.liff.sessionError);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void continueToBadge()}
        disabled={busy}
      >
        {busy ? messages.liff.verifying : messages.liff.continue}
      </button>
      {error ? <small>{error}</small> : null}
    </>
  );
}
