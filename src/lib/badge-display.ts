import type {
  BadgeDisplayItem,
  BadgeDisplayRow,
  CustomerBadgeDisplay,
} from "@/types/badge";

const DEFAULT_SUPPORT_MESSAGE =
  "Please contact Sony Thailand support if badge data looks incorrect.";

function clampProgress(matchedCount: number, requiredCount: number): number {
  if (requiredCount <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((matchedCount / requiredCount) * 100));
}

function formatDate(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export function mapBadgeRows(rows: BadgeDisplayRow[]): CustomerBadgeDisplay | null {
  const first = rows[0];

  if (!first) {
    return null;
  }

  const badges: BadgeDisplayItem[] = rows.map((row) => {
    const matchedCount = row.matched_count ?? 0;
    const status =
      matchedCount === 0
        ? "no-badge"
        : matchedCount >= row.required_count
          ? "earned"
          : "locked";
    const remainingCount = Math.max(row.required_count - matchedCount, 0);

    return {
      code: row.badge_code,
      name: row.badge_name,
      type: row.badge_type,
      description: row.description,
      status,
      progress: clampProgress(matchedCount, row.required_count),
      remainingCount,
      matchedCount,
      requiredCount: row.required_count,
      imageUrl: status === "earned" ? row.image_url : row.locked_image_url,
      serialNumber: row.serial_number,
      modelName: row.model_name,
      registrationDate: formatDate(row.registration_date),
    };
  });

  return {
    customerId: first.customer_id,
    displayName: first.display_name,
    lineDisplayName: first.line_display_name,
    linePictureUrl: first.line_picture_url,
    supportMessage: first.support_message ?? DEFAULT_SUPPORT_MESSAGE,
    badges,
  };
}

export const demoBadgeDisplay: CustomerBadgeDisplay = {
  customerId: "demo-earned",
  displayName: "Nicha Wong",
  lineDisplayName: "Nicha",
  linePictureUrl: null,
  supportMessage: DEFAULT_SUPPORT_MESSAGE,
  badges: [
    {
      code: "alpha-owner",
      name: "Alpha Owner",
      type: "product",
      description: "Own a supported Sony Alpha camera.",
      status: "earned",
      progress: 100,
      remainingCount: 0,
      matchedCount: 1,
      requiredCount: 1,
      imageUrl: "https://placehold.co/240x240?text=Alpha",
      serialNumber: "SN-A7M4-001",
      modelName: "ILCE-7M4",
      registrationDate: "2026-05-20",
    },
    {
      code: "lens-collector",
      name: "Lens Collector",
      type: "quest",
      description: "Register three eligible Sony lens products.",
      status: "locked",
      progress: 33,
      remainingCount: 2,
      matchedCount: 1,
      requiredCount: 3,
      imageUrl: "https://placehold.co/240x240?text=Locked",
      serialNumber: "SN-LENS-001",
      modelName: "SEL35F14GM",
      registrationDate: "2026-05-21",
    },
    {
      code: "audio-starter",
      name: "Audio Starter",
      type: "quest",
      description: "Register an eligible audio product to begin this quest.",
      status: "no-badge",
      progress: 0,
      remainingCount: 1,
      matchedCount: 0,
      requiredCount: 1,
      imageUrl: "https://placehold.co/240x240?text=Locked",
      serialNumber: null,
      modelName: null,
      registrationDate: null,
    },
  ],
};
