"use client";

import { useEffect, useState } from "react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { getPublicAppBaseUrl, toShareableAssetUrl } from "@/lib/absolute-url";
import { getCurrentLiffClient } from "@/lib/liff-session";

type FacebookShareActionProps = {
  label: string;
  /** Absolute URL or app path to share. Defaults to the current page URL. */
  url?: string;
  hashtag?: string;
  className?: string;
};

export function FacebookShareAction({
  label,
  url,
  hashtag,
  className,
}: FacebookShareActionProps): JSX.Element {
  const [shareUrl, setShareUrl] = useState(() => resolveShareUrl(url));

  useEffect(() => {
    setShareUrl(resolveShareUrl(url));
  }, [url]);

  const classes = ["sonyButton", "sonyButton--solid", className]
    .filter(Boolean)
    .join(" ");

  async function handleShare() {
    if (!shareUrl) {
      return;
    }

    // Guard: never share a URL that still contains raw spaces.
    if (/\s/.test(shareUrl)) {
      console.error("Refusing to share URL with raw spaces:", shareUrl);
      return;
    }

    const sharerUrl = buildFacebookSharerUrl(shareUrl, hashtag);

    try {
      const liff = await getCurrentLiffClient();
      if (liff.isInClient() && typeof liff.openWindow === "function") {
        liff.openWindow({ url: sharerUrl, external: true });
        return;
      }
    } catch {
      // Fall through to window.open
    }

    window.open(sharerUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={!shareUrl}
      aria-label={label}
      onClick={() => {
        void handleShare();
      }}
    >
      <span className="sonyButton__icon">
        <FacebookIcon />
      </span>
      <span className="sonyButton__label">{label}</span>
    </button>
  );
}

function resolveShareUrl(url: string | undefined): string {
  if (!url) {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.href;
  }

  return toShareableAssetUrl(url, getPublicAppBaseUrl()) ?? "";
}

function buildFacebookSharerUrl(url: string, hashtag?: string): string {
  const sharer = new URL("https://www.facebook.com/sharer/sharer.php");
  sharer.searchParams.set("u", url);
  if (hashtag) {
    sharer.searchParams.set("hashtag", hashtag);
  }
  return sharer.toString();
}
