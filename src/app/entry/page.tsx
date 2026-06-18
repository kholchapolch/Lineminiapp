import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loadAppConfig } from "@/lib/app-config";
import { resolveLineUuid } from "@/lib/lineuuid";
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

  const resolvedLineUuid = resolveLineUuid({
    appEnv: config.appEnv,
    providedLineUuid: searchParams?.lineuuid,
    demoLineUuid: config.sonyDemoLineUuid,
  });

  if (!resolvedLineUuid.lineUuid) {
    redirect("/badge?entryError=missingLineUuid");
  }

  redirect(`/badge?lineuuid=${encodeURIComponent(resolvedLineUuid.lineUuid)}`);
}
