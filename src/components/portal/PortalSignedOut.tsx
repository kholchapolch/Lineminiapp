"use client";

import { useEffect, useRef, useState } from "react";
import { useLineSession } from "@/components/LineSessionProvider";
import { PortalProductSkeleton } from "@/components/portal/PortalProductSkeleton";
import { portalSessionRefreshGaveUp } from "@/components/portal/PortalSessionRefresh";

export function PortalSignedOut({
  sessionRequired,
  loadingAriaLabel,
}: {
  sessionRequired: string;
  loadingAriaLabel: string;
}): JSX.Element {
  const { status } = useLineSession();
  const retriedOnMount = useRef<boolean | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (retriedOnMount.current === null) {
      retriedOnMount.current = portalSessionRefreshGaveUp("ready");
    }

    if (status === "idle" || status === "loading") {
      return;
    }

    if (status !== "ready" || retriedOnMount.current) {
      setGaveUp(true);
      return;
    }

    const timer = window.setTimeout(() => setGaveUp(true), 8000);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (!gaveUp) {
    return <PortalProductSkeleton ariaLabel={loadingAriaLabel} />;
  }

  return <p>{sessionRequired}</p>;
}
