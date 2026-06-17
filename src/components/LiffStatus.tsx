"use client";

import { useEffect, useState } from "react";

type LiffState =
  | { status: "loading"; message: string }
  | { status: "mock"; message: string }
  | { status: "ready"; message: string }
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

        setState(
          isInClient
            ? {
                status: "ready",
                message: "Running inside LINE",
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
    <p className={`liffStatus ${state.status}`} aria-live="polite">
      {state.message}
    </p>
  );
}
