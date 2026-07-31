import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/locales";
import { getPublicProductShareMeta } from "@/lib/share/get-public-share-meta";
import { loadAppConfig } from "@/lib/app-config";
import { toAbsoluteUrl, toShareableAssetUrl } from "@/lib/absolute-url";
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
  const ogTitle = messages.shareOg.title;
  const ogDescription = messages.shareOg.description;

  if (!meta) {
    return {
      title: ogTitle,
      description: ogDescription,
    };
  }

  const appBaseUrl = loadAppConfig().appBaseUrl;
  const pageUrl = toAbsoluteUrl(meta.pagePath, appBaseUrl);
  const imageUrl = toShareableAssetUrl(meta.imageUrl, appBaseUrl) ?? meta.imageUrl;

  return {
    metadataBase: new URL(appBaseUrl),
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: pageUrl ?? undefined,
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: ogTitle,
              type: imageUrl.toLowerCase().endsWith(".png") ? "image/png" : undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: imageUrl ? [imageUrl] : undefined,
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
      <h1>{messages.shareOg.title}</h1>
      <p>{messages.shareOg.description}</p>
      {meta.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Share preview image from badge rules / public assets.
        <img src={meta.imageUrl} alt={messages.shareOg.title} />
      ) : null}
    </main>
  );
}
