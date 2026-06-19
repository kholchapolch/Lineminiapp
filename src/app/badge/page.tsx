import { BadgeClient } from "@/app/badge/BadgeClient";

export const dynamic = "force-dynamic";

export default function BadgePage({
  searchParams,
}: {
  searchParams?: { lineuuid?: string; entryError?: string; debug?: string };
}): JSX.Element {
  return (
    <BadgeClient
      lineuuid={searchParams?.lineuuid}
      debug={searchParams?.debug}
      entryError={searchParams?.entryError}
    />
  );
}
