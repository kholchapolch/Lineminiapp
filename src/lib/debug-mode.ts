import type { AppEnv } from "@/lib/app-config";
import type { BadgeResultPayload } from "@/types/badge";

export type DebugModeInput = {
  appEnv: AppEnv;
  debugParam?: string | null;
  envFlag?: string | null;
};

export type DebugJsonPayload = {
  customer: {
    customerIdPresent: boolean;
    displayNamePresent: boolean;
    lineDisplayNamePresent: boolean;
    lineuuidPresent: boolean;
    linePictureUrlPresent: boolean;
  };
  products: Array<{
    sku: string;
    modelNamePresent: boolean;
    registeredAtPresent: boolean;
    serialNumberPresent: boolean;
  }>;
  badges: Array<{
    code: string;
    type: string;
    status: string;
    progress: number;
    matchedCount: number;
    requiredCount: number;
    remainingCount: number;
    level: string | null;
    imageUrl: string | null;
  }>;
  badgeShelf: Array<{
    code: string;
    ruleCode: string;
    level: string;
    label: string;
    title: string;
    ruleConditionText: string;
    status: string;
    visualState: string;
    matchedCount: number;
    requiredCount: number;
    progress: number;
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

export function isDebugTraceEnabled({
  appEnv,
  debugParam,
}: Pick<DebugModeInput, "appEnv" | "debugParam">): boolean {
  if (appEnv === "production") {
    return false;
  }

  return debugParam?.trim() === "1";
}

export function toDebugJsonPayload(payload: BadgeResultPayload): DebugJsonPayload {
  return {
    customer: {
      customerIdPresent: Boolean(payload.customer.customerId),
      displayNamePresent: Boolean(payload.customer.displayName),
      lineDisplayNamePresent: Boolean(payload.customer.lineDisplayName),
      lineuuidPresent: Boolean(payload.customer.lineuuid),
      linePictureUrlPresent: Boolean(payload.customer.linePictureUrl),
    },
    products: payload.products.map((product) => ({
      sku: product.sku,
      modelNamePresent: Boolean(product.modelName),
      registeredAtPresent: Boolean(product.registeredAt),
      serialNumberPresent: Boolean(product.serialNumber),
    })),
    badges: payload.badges.map((badge) => ({
      code: badge.code,
      type: badge.type,
      status: badge.status,
      progress: badge.progress,
      matchedCount: badge.matchedCount,
      requiredCount: badge.requiredCount,
      remainingCount: badge.remainingCount,
      level: badge.level ?? null,
      imageUrl: badge.imageUrl,
    })),
    badgeShelf: payload.badgeShelf.map((badge) => ({
      code: badge.code,
      ruleCode: badge.ruleCode,
      level: badge.level,
      label: badge.label,
      title: badge.title,
      ruleConditionText: badge.ruleConditionText,
      status: badge.status,
      visualState: badge.visualState,
      matchedCount: badge.matchedCount,
      requiredCount: badge.requiredCount,
      progress: badge.progress,
      imageUrl: badge.imageUrl,
    })),
    supportMessage: payload.supportMessage,
  };
}

function isTruthy(value: string | null | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}
