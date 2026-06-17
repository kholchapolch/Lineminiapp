"use client";

import { useEffect, useState } from "react";

type LiffState =
  | { status: "loading"; message: string }
  | { status: "mock"; message: string }
  | { status: "ready"; message: string; lineUuid?: string }
  | { status: "unsupported"; message: string }
  | { status: "error"; message: string };

export function LiffStatus(): JSX.Element {
  const [state, setState] = useState<LiffState>({
    status: "loading",
    message: "Checking LIFF session",
  });

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      setState({
        status: "mock",
        message: "Local preview mode. Set NEXT_PUBLIC_LIFF_ID to test LINE LIFF.",
      });
      return;
    }

    const configuredLiffId = liffId;
    let active = true;

    setState({
      status: "loading",
      message: "Initializing LIFF session",
    });

    async function initLiff() {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId: configuredLiffId });

        if (!active) {
          return;
        }

        const isInClient = liff.isInClient();
        const profile = isInClient ? await liff.getProfile() : undefined;

        setState(
          isInClient
            ? {
                status: "ready",
                message: "Running inside LINE",
                lineUuid: profile?.userId,
              }
            : {
                status: "unsupported",
                message: "LIFF initialized outside LINE for preview only",
              },
        );
      } catch {
        if (!active) {
          return;
        }

        setState({
          status: "error",
          message: "LIFF could not initialize. Check LIFF ID and endpoint URL.",
        });
      }
    }

    void initLiff();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`liffStatus ${state.status}`} aria-live="polite">
      <p>{state.message}</p>
      {state.status === "ready" && state.lineUuid ? (
        <a href={`/entry?lineuuid=${encodeURIComponent(state.lineUuid)}`}>Continue</a>
      ) : null}
    </div>
  );
}
