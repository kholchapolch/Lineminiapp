import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/locales";
import { getPublicMissionShareMeta } from "@/lib/share/get-public-share-meta";
import { loadAppConfig } from "@/lib/app-config";
import { toAbsoluteUrl } from "@/lib/absolute-url";
import "../../share.css";

type ShareMissionPageProps = {
  params: { locale: string; missionId: string };
};

export async function generateMetadata({
  params,
}: ShareMissionPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);
  const meta = await getPublicMissionShareMeta(params.locale, params.missionId);

  if (!meta) {
    return {
      title: messages.myMission.meta.title,
      description: messages.myMission.meta.description,
    };
  }

  const pageUrl = toAbsoluteUrl(meta.pagePath, loadAppConfig().appBaseUrl);

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: pageUrl ?? undefined,
      type: "website",
      images: meta.imageUrl
        ? [{ url: meta.imageUrl, alt: meta.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: meta.imageUrl ? [meta.imageUrl] : undefined,
    },
  };
}

export default async function ShareMissionPage({
  params,
}: ShareMissionPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const messages = getDictionary(params.locale);
  const meta = await getPublicMissionShareMeta(params.locale, params.missionId);

  if (!meta) {
    notFound();
  }

  return (
    <main className="sharePage">
      <h1>{meta.title}</h1>
      <p>{meta.description}</p>
      {meta.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Share preview image from badge rules / public assets.
        <img src={meta.imageUrl} alt={meta.title} />
      ) : null}
      <p>{messages.myMission.share}</p>
    </main>
  );
}
