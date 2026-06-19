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
      const liff = (await import("@line/liff")).default;
      const idToken = liff.getIDToken();

      if (!idToken) {
        throw new Error("Missing LINE ID token.");
      }

      const response = await fetch("/api/line-session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("LINE session could not be verified.");
      }

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
