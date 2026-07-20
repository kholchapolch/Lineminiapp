import "server-only";

import { headers } from "next/headers";
import { loadAppConfig } from "@/lib/app-config";
import { readLineSessionFromHeaders } from "@/lib/auth-session";
import { getLocalPreviewLineUuid } from "@/lib/badge-landing";

export async function getServerLineUuid({
  allowLocalPreview = false,
}: {
  allowLocalPreview?: boolean;
} = {}): Promise<string | null> {
  const config = loadAppConfig();
  const session = readLineSessionFromHeaders(headers(), config);
  return session?.lineuuid ?? getLocalPreviewLineUuid(config, allowLocalPreview);
}
