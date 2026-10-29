"use client";

import { useEffect, useRef } from "react";
import { useLineSession } from "@/components/LineSessionProvider";
import { SonyDataLayerDebug } from "@/components/SonyDataLayerDebug";
import {
  markSonyDataLayerReady,
  shouldDispatchDataLayerReady,
} from "@/lib/tealium";

/** Same data-layer ready + ?debug=1 overlay path as my-badges. */
export function PortalDataLayerDebug(): JSX.Element {
  const { lineUuid, status } = useLineSession();
  const dataLayerReadyDispatched = useRef(false);

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

  return <SonyDataLayerDebug />;
}
