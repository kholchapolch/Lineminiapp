"use client";

import { useEffect } from "react";
import { useLineSession } from "@/components/LineSessionProvider";

const REFRESH_KEY = "portal-session-refresh";

export function PortalSessionRefresh({
  hasSession,
}: {
  hasSession: boolean;
}): null {
  const { status } = useLineSession();

  useEffect(() => {
    if (hasSession) {
      sessionStorage.removeItem(REFRESH_KEY);
      return;
    }

    if (status !== "ready" || sessionStorage.getItem(REFRESH_KEY) === "1") {
      return;
    }

    sessionStorage.setItem(REFRESH_KEY, "1");
    window.location.reload();
  }, [hasSession, status]);

  return null;
}

export function portalSessionRefreshGaveUp(status: string): boolean {
  if (status === "idle" || status === "loading") {
    return false;
  }

  if (status !== "ready") {
    return true;
  }

  return sessionStorage.getItem(REFRESH_KEY) === "1";
}
