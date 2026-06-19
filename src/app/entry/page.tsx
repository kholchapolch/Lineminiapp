import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loadAppConfig } from "@/lib/app-config";
import { resolveAuthorizedLineUuid } from "@/lib/auth-session";
import { evaluateRedirectGuard } from "@/lib/redirect-guard";

export const dynamic = "force-dynamic";

type EntryPageProps = {
  searchParams?: {
    lineuuid?: string;
  };
};

export default function EntryPage({ searchParams }: EntryPageProps): never {
  const config = loadAppConfig();
  const requestHeaders = headers();
  const guard = evaluateRedirectGuard(requestHeaders, config);

  if (!guard.allowed) {
    redirect(`/badge?entryError=${guard.reason}`);
  }

  let lineuuid: string;

  try {
    lineuuid = resolveAuthorizedLineUuid({
      config,
      headers: requestHeaders,
      providedLineUuid: searchParams?.lineuuid,
    });
  } catch {
    redirect("/badge?entryError=missingLineSession");
  }

  redirect(config.appEnv === "local" ? `/badge?lineuuid=${encodeURIComponent(lineuuid)}` : "/badge");
}
