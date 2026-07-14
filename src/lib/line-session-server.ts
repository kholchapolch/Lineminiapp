import "server-only";

import { headers } from "next/headers";
import { loadAppConfig } from "@/lib/app-config";
import { readLineSessionFromHeaders } from "@/lib/auth-session";

export async function getServerLineUuid(): Promise<string | null> {
  const session = readLineSessionFromHeaders(headers(), loadAppConfig());
  return session?.lineuuid ?? null;
}
