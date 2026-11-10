// PROTOTYPE: Draft Sony CS Portal flow from the client wireframe.
// Mock UUID scenarios are shareable through ?uuid=. This route is disabled in production.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CsPortalPrototype } from "@/app/[locale]/(csr_portal)/prototype/cs-portal/CsPortalPrototype";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { resolvePortalScenario } from "@/lib/cs-portal-prototype/mock-engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sony CS Portal · Local Prototype",
  description: "Local-only UX and edge-case prototype for the Sony CS Portal.",
};

type PrototypePageProps = {
  params: { locale: string };
  searchParams: { uuid?: string | string[] };
};

export default function CsPortalPrototypePage({
  params,
  searchParams,
}: PrototypePageProps): JSX.Element {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const rawUuid = Array.isArray(searchParams.uuid)
    ? searchParams.uuid[0]
    : searchParams.uuid;
  const scenario = resolvePortalScenario(rawUuid);

  return <CsPortalPrototype locale={locale} scenario={scenario} />;
}
