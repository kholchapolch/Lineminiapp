import { redirect } from "next/navigation";
import { loadAppConfig } from "@/lib/app-config";

export const dynamic = "force-dynamic";

export default function Home({
  searchParams,
}: {
  searchParams?: { lineuuid?: string };
}): never {
  const config = loadAppConfig();
  const lineuuid = searchParams?.lineuuid?.trim();

  redirect(config.appEnv === "local" && lineuuid ? `/badge?lineuuid=${encodeURIComponent(lineuuid)}` : "/badge");
}
