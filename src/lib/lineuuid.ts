import type { AppEnv } from "@/lib/app-config";

export type ResolvedLineUuid = {
  lineUuid: string | null;
  usedDemoFallback: boolean;
};

export function resolveLineUuid({
  appEnv,
  providedLineUuid,
  demoLineUuid,
}: {
  appEnv: AppEnv;
  providedLineUuid?: string | null;
  demoLineUuid: string;
}): ResolvedLineUuid {
  const trimmedLineUuid = providedLineUuid?.trim();

  if (trimmedLineUuid) {
    return { lineUuid: trimmedLineUuid, usedDemoFallback: false };
  }

  if (appEnv === "local") {
    return { lineUuid: demoLineUuid, usedDemoFallback: true };
  }

  return { lineUuid: null, usedDemoFallback: false };
}
