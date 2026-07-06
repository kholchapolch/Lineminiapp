import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loadAppConfig } from "@/lib/app-config";
import { resolveAuthorizedLineUuid } from "@/lib/auth-session";
import { evaluateRedirectGuard } from "@/lib/redirect-guard";

export const dynamic = "force-dynamic";

export default function EntryPage(): never {
  const config = loadAppConfig();
  const requestHeaders = headers();
  const guard = evaluateRedirectGuard(requestHeaders, config);

  if (!guard.allowed) {
    redirect(`/badge?entryError=${guard.reason}`);
  }

  try {
    resolveAuthorizedLineUuid({
      config,
      headers: requestHeaders,
    });
  } catch {
    redirect("/badge?entryError=missingLineSession");
  }

  redirect("/badge");
}
