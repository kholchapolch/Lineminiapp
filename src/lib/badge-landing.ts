import type { AppConfig } from "@/lib/app-config";

export type BadgeLandingMode = "local-preview" | "line-session" | "diagnostic";

export function resolveBadgeLandingMode(
  config: AppConfig,
  debug?: string,
): BadgeLandingMode {
  if (debug === "1") {
    return "diagnostic";
  }

  if (config.appEnv === "local" && config.sonyProductApiMode === "mock") {
    return "local-preview";
  }

  return "line-session";
}

export function getLocalPreviewLineUuid(
  config: AppConfig,
  allowLocalPreview: boolean,
): string | null {
  return allowLocalPreview && resolveBadgeLandingMode(config) === "local-preview"
    ? config.sonyDemoLineUuid
    : null;
}
