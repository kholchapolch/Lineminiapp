"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createLineSessionFromCurrentLiff,
  getLineProfileFromCurrentLiff,
  type LineProfile,
} from "@/lib/liff-session";
import { readStoredLineUuid, storeLineUuid } from "@/lib/line-session-storage";

export type LineSessionStatus = "idle" | "loading" | "ready" | "unavailable";

export type LineSessionState = {
  lineUuid: string | null;
  lineProfile: LineProfile | null;
  status: LineSessionStatus;
};

const LineSessionContext = createContext<LineSessionState | null>(null);

type LineSessionProviderProps = {
  children: ReactNode;
};

export function LineSessionProvider({
  children,
}: LineSessionProviderProps): JSX.Element {
  const [lineUuid, setLineUuid] = useState<string | null>(null);
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [status, setStatus] = useState<LineSessionStatus>("idle");

  useEffect(() => {
    const persistedLineUuid = readStoredLineUuid();

    if (persistedLineUuid) {
      setLineUuid(persistedLineUuid);
    }

    if (!process.env.NEXT_PUBLIC_LIFF_ID) {
      setStatus("unavailable");
      return;
    }

    let active = true;

    setStatus("loading");

    async function bootstrapLineSession() {
      try {
        const session = await createLineSessionFromCurrentLiff();

        if (!active) {
          return;
        }

        applyProfile(session.profile);
        setStatus(session.profile?.userId ? "ready" : "unavailable");
        return;
      } catch {
        if (!active) {
          return;
        }
      }

      const profile = await getLineProfileFromCurrentLiff();

      if (!active) {
        return;
      }

      if (profile) {
        applyProfile(profile);
        setStatus(profile.userId ? "ready" : "unavailable");
        return;
      }

      setStatus(persistedLineUuid ? "ready" : "unavailable");
    }

    function applyProfile(profile?: LineProfile) {
      if (!profile) {
        return;
      }

      setLineProfile(profile);

      if (profile.userId) {
        setLineUuid(profile.userId);
        storeLineUuid(profile.userId);
      }
    }

    void bootstrapLineSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<LineSessionState>(
    () => ({
      lineUuid,
      lineProfile,
      status,
    }),
    [lineProfile, lineUuid, status],
  );

  console.log("Status", status);

  return (
    <LineSessionContext.Provider value={value}>
      {children}
    </LineSessionContext.Provider>
  );
}

export function useLineSession(): LineSessionState {
  const context = useContext(LineSessionContext);

  if (!context) {
    throw new Error("useLineSession must be used within LineSessionProvider.");
  }

  return context;
}
