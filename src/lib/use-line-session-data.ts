"use client";

import { useEffect, useState } from "react";
import { useLineSession } from "@/components/LineSessionProvider";

type LineSessionDataState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export function useLineSessionData<T>(
  endpoint: string,
  errorMessage: string,
): LineSessionDataState<T> {
  const { lineUuid, status } = useLineSession();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      return;
    }

    const controller = new AbortController();
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = lineUuid
      ? `${endpoint}${separator}lineuuid=${encodeURIComponent(lineUuid)}`
      : endpoint;

    setData(null);
    setError(null);

    async function loadData() {
      try {
        const response = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(errorMessage);
        }

        setData((await response.json()) as T);
      } catch (cause: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setError(cause instanceof Error ? cause.message : errorMessage);
      }
    }

    void loadData();

    return () => {
      controller.abort();
    };
  }, [endpoint, errorMessage, lineUuid, status]);

  return {
    data,
    error,
    isLoading:
      status === "idle" || status === "loading" || (!error && !data),
  };
}
