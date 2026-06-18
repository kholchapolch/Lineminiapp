import type { BadgeStatus } from "@/types/badge";

export type BadgeArtPresentation = {
  label: string;
  imageUrl: string | null;
  imageClassName: string | null;
  isDimmed: boolean;
};

export function getBadgeArtPresentation({
  status,
  imageUrl,
}: {
  status: BadgeStatus;
  imageUrl: string | null;
}): BadgeArtPresentation {
  const label = getBadgeStatusLabel(status);
  const isDimmed = status !== "earned";

  return {
    label,
    imageUrl,
    imageClassName: imageUrl ? `badgeImage ${isDimmed ? "dimmed" : "earned"}` : null,
    isDimmed,
  };
}

function getBadgeStatusLabel(status: BadgeStatus): string {
  if (status === "earned") {
    return "Earned";
  }

  if (status === "locked") {
    return "Locked";
  }

  return "No badge";
}
