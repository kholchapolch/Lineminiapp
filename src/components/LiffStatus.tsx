"use client";

import { useEffect, useState } from "react";
import { createLineSessionFromCurrentLiff, getCurrentLiffClient } from "@/lib/liff-session";

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

    let active = true;

    setState({
      status: "loading",
      message: "Initializing LIFF session",
    });

    async function initLiff() {
      try {
        const liff = await getCurrentLiffClient();

        if (!active) {
          return;
        }

        const isInClient = liff.isInClient();
        const profile = isInClient && liff.getProfile ? await liff.getProfile() : undefined;

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
        <LineSessionButton />
      ) : null}
    </div>
  );
}

function LineSessionButton(): JSX.Element {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueToBadge() {
    setBusy(true);
    setError(null);

    try {
      await createLineSessionFromCurrentLiff();
      window.location.assign("/entry");
    } catch {
      setError("LINE session could not be verified.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => void continueToBadge()} disabled={busy}>
        {busy ? "Verifying" : "Continue"}
      </button>
      {error ? <small>{error}</small> : null}
    </>
  );
}
