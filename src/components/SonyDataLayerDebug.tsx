"use client";

import { useEffect, useRef, useState } from "react";
import {
  SONY_DATALAYER_DEBUG_KEY,
  isDataLayerDebugEnabled,
} from "@/lib/sony-data-layer-debug";
import { sonyDataLayerScript } from "@/lib/tealium";

type SonyLayer = {
  digitalData?: {
    page?: Record<string, unknown>;
    user?: { id?: string };
  };
};

declare global {
  interface Window {
    buildSonyDataLayer?: () => SonyLayer;
  }
}

function readStoredDebugFlag(): string | null {
  try {
    return window.sessionStorage.getItem(SONY_DATALAYER_DEBUG_KEY);
  } catch {
    return null;
  }
}

function rememberDebugFlag(): void {
  if (new URLSearchParams(window.location.search).get("debug") !== "1") {
    return;
  }

  try {
    window.sessionStorage.setItem(SONY_DATALAYER_DEBUG_KEY, "1");
  } catch {
    // Private mode can block storage. The query string still enables this view.
  }
}

function ensureDataLayer(installed: { current: boolean }): void {
  if (typeof window.buildSonyDataLayer === "function" || installed.current) {
    return;
  }

  installed.current = true;
  const script = document.createElement("script");
  script.text = sonyDataLayerScript();
  document.body.appendChild(script);
}

export function SonyDataLayerDebug(): JSX.Element | null {
  const installedDataLayer = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [userId, setUserId] = useState("");
  const [snapshot, setSnapshot] = useState("waiting for buildSonyDataLayer()");

  useEffect(() => {
    rememberDebugFlag();
    setEnabled(
      isDataLayerDebugEnabled(window.location.search, readStoredDebugFlag()),
    );
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const read = (): void => {
      ensureDataLayer(installedDataLayer);
      const build = window.buildSonyDataLayer;
      if (typeof build !== "function") {
        setUserId("");
        setSnapshot("buildSonyDataLayer is not defined");
        return;
      }

      const layer = build();
      setUserId(layer?.digitalData?.user?.id ?? "");
      setSnapshot(JSON.stringify(layer, null, 2));
    };

    read();
    const timer = window.setInterval(read, 500);
    return () => window.clearInterval(timer);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <aside
      aria-label="buildSonyDataLayer debug"
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        left: 12,
        zIndex: 80,
        maxHeight: "42vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        boxSizing: "border-box",
        padding: "12px 14px 20px",
        borderRadius: 12,
        background: "rgba(0, 0, 0, 0.92)",
        color: "#ffffff",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        pointerEvents: "auto",
        touchAction: "pan-y",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "#9ecbff" }}>
        buildSonyDataLayer()
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 13 }}>user.id</p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.3,
          wordBreak: "break-all",
        }}
      >
        {userId || "(empty)"}
      </p>
      <pre
        style={{
          margin: "10px 0 0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {snapshot}
      </pre>
    </aside>
  );
}
