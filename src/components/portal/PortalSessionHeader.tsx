"use client";

import { useLineSession } from "@/components/LineSessionProvider";
import { PortalHeader } from "@/components/portal/PortalHeader";

export function PortalSessionHeader({
  profileFallbackName,
}: {
  profileFallbackName: string;
}): JSX.Element {
  const { lineProfile, status } = useLineSession();
  const pending = status === "idle" || status === "loading";

  return (
    <PortalHeader
      pending={pending}
      displayName={lineProfile?.displayName ?? profileFallbackName}
      pictureUrl={lineProfile?.pictureUrl}
    />
  );
}
