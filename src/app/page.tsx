import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home({
  searchParams,
}: {
  searchParams?: { lineuuid?: string };
}): never {
  const lineuuid = searchParams?.lineuuid?.trim();

  redirect(lineuuid ? `/badge?lineuuid=${encodeURIComponent(lineuuid)}` : "/badge");
}
