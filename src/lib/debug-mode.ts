import type { AppEnv } from "@/lib/app-config";
import type { BadgeResultPayload } from "@/types/badge";

export type DebugModeInput = {
  appEnv: AppEnv;
  debugParam?: string | null;
  envFlag?: string | null;
};

export type DebugJsonPayload = {
  customer: {
    customerId: string;
    displayName: string;
    lineDisplayName: string | null;
    lineuuidPresent: boolean;
  };
  products: Array<{
    sku: string;
    modelName: string | null;
    registeredAt: string;
    serialNumber: string | null;
  }>;
  badges: Array<{
    code: string;
    name: string;
    type: string;
    status: string;
    progress: number;
    matchedCount: number;
    requiredCount: number;
    remainingCount: number;
    imageUrl: string | null;
  }>;
  badgeShelf: Array<{
    code: string;
    label: string;
    title: string;
    status: string;
    visualState: string;
    imageUrl: string | null;
  }>;
  supportMessage: string;
};

export function isDebugModeEnabled({
  appEnv,
  debugParam,
  envFlag,
}: DebugModeInput): boolean {
  if (appEnv === "production") {
    return false;
  }

  return isTruthy(debugParam) || isTruthy(envFlag);
}

export function toDebugJsonPayload(payload: BadgeResultPayload): DebugJsonPayload {
  return {
    customer: {
      customerId: payload.customer.customerId,
      displayName: payload.customer.displayName,
      lineDisplayName: payload.customer.lineDisplayName,
      lineuuidPresent: Boolean(payload.customer.lineuuid),
    },
    products: payload.products.map((product) => ({
      sku: product.sku,
      modelName: product.modelName,
      registeredAt: product.registeredAt,
      serialNumber: product.serialNumber,
    })),
    badges: payload.badges.map((badge) => ({
      code: badge.code,
      name: badge.name,
      type: badge.type,
      status: badge.status,
      progress: badge.progress,
      matchedCount: badge.matchedCount,
      requiredCount: badge.requiredCount,
      remainingCount: badge.remainingCount,
      imageUrl: badge.imageUrl,
    })),
    badgeShelf: payload.badgeShelf.map((badge) => ({
      code: badge.code,
      label: badge.label,
      title: badge.title,
      status: badge.status,
      visualState: badge.visualState,
      imageUrl: badge.imageUrl,
    })),
    supportMessage: payload.supportMessage,
  };
}

function isTruthy(value: string | null | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}
