import type { BadgeDisplayItem, BadgeShelfItem } from "@/types/badge";

type ShelfDefinition = {
  code: string;
  sourceCode?: string;
  level?: string;
  label: string;
  title: string;
  description: string;
  requiredCount: number;
  imageUrl: string;
  lockedImageUrl: string;
};

const SHELF_DEFINITIONS: ShelfDefinition[] = [
  {
    code: "alpha-bronze",
    sourceCode: "alpha-tier",
    level: "bronze",
    label: "Bronze",
    title: "Alpha Collector Bronze",
    description: "Register one eligible Sony Alpha product.",
    requiredCount: 1,
    imageUrl: "https://placehold.co/240x240?text=Bronze",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "alpha-silver",
    sourceCode: "alpha-tier",
    level: "silver",
    label: "Silver",
    title: "Alpha Collector Silver",
    description: "Register two eligible Sony Alpha products.",
    requiredCount: 2,
    imageUrl: "https://placehold.co/240x240?text=Silver",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "alpha-gold",
    sourceCode: "alpha-tier",
    level: "gold",
    label: "Gold",
    title: "Alpha Collector Gold",
    description: "Register three eligible Sony Alpha products.",
    requiredCount: 3,
    imageUrl: "https://placehold.co/240x240?text=Gold",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "pro-achievement",
    sourceCode: "pro-achievement",
    level: "achievement",
    label: "Achievement",
    title: "Pro Achievement",
    description: "Complete the campaign product ownership challenge once.",
    requiredCount: 3,
    imageUrl: "https://placehold.co/240x240?text=Achievement",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "camera-starter",
    label: "Starter",
    title: "Camera Starter",
    description: "Future badge for first camera registration.",
    requiredCount: 1,
    imageUrl: "https://placehold.co/240x240?text=Starter",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "lens-lover",
    label: "Lens",
    title: "Lens Lover",
    description: "Future badge for lens collection behavior.",
    requiredCount: 1,
    imageUrl: "https://placehold.co/240x240?text=Lens",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "audio-fan",
    label: "Audio",
    title: "Audio Fan",
    description: "Future badge for eligible Sony audio products.",
    requiredCount: 1,
    imageUrl: "https://placehold.co/240x240?text=Audio",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "creator-pass",
    label: "Creator",
    title: "Creator Pass",
    description: "Future badge for creator campaign participation.",
    requiredCount: 1,
    imageUrl: "https://placehold.co/240x240?text=Creator",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
  {
    code: "event-pass",
    label: "Event",
    title: "Event Pass",
    description: "Future badge for Sony event attendance.",
    requiredCount: 1,
    imageUrl: "https://placehold.co/240x240?text=Event",
    lockedImageUrl: "https://placehold.co/240x240?text=Locked",
  },
];

export function buildBadgeShelf(badges: BadgeDisplayItem[]): BadgeShelfItem[] {
  return SHELF_DEFINITIONS.map((definition) => {
    const sourceBadge = definition.sourceCode
      ? badges.find((badge) => badge.code === definition.sourceCode)
      : undefined;
    const achieved = sourceBadge ? sourceBadge.matchedCount >= definition.requiredCount : false;

    return {
      code: definition.code,
      label: definition.label,
      title: definition.title,
      description: definition.description,
      imageUrl: achieved ? definition.imageUrl : definition.lockedImageUrl,
      status: achieved ? "achieved" : "available",
      visualState: achieved ? "color" : "dimmed",
    };
  });
}
