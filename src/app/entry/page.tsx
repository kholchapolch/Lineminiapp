import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loadAppConfig } from "@/lib/app-config";
import { evaluateRedirectGuard } from "@/lib/redirect-guard";

export const dynamic = "force-dynamic";

type EntryPageProps = {
  searchParams?: {
    lineuuid?: string;
  };
};

export default function EntryPage({ searchParams }: EntryPageProps): never {
  const config = loadAppConfig();
  const guard = evaluateRedirectGuard(headers(), config);

  if (!guard.allowed) {
    redirect(`/badge?entryError=${guard.reason}`);
  }

  const lineUuid = searchParams?.lineuuid?.trim() || config.sonyDemoLineUuid;
  redirect(`/badge?lineuuid=${encodeURIComponent(lineUuid)}`);
}
