import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/locales";
import { getPublicProductShareMeta } from "@/lib/share/get-public-share-meta";
import { loadAppConfig } from "@/lib/app-config";
import { toAbsoluteUrl } from "@/lib/absolute-url";
import "../../share.css";

type ShareProductPageProps = {
  params: { locale: string; productId: string };
};

export async function generateMetadata({
  params,
}: ShareProductPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {};
  }

  const messages = getDictionary(params.locale);
  const meta = await getPublicProductShareMeta(params.locale, params.productId);

  if (!meta) {
    return {
      title: messages.myProduct.meta.title,
      description: messages.myProduct.meta.description,
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

export default async function ShareProductPage({
  params,
}: ShareProductPageProps): Promise<JSX.Element> {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const messages = getDictionary(params.locale);
  const meta = await getPublicProductShareMeta(params.locale, params.productId);

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
      <p>{messages.myProduct.shareTitle}</p>
    </main>
  );
}
