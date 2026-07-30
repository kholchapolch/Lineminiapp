"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { FacebookShareButton } from "react-share";
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
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setShareUrl(resolveShareUrl(url));
  }, [url]);

  const classes = ["sonyButton", "sonyButton--solid", className]
    .filter(Boolean)
    .join(" ");
  const disabled = !shareUrl || isSharing;

  async function handleShare(_event: MouseEvent<HTMLButtonElement>, link: string) {
    if (!shareUrl || !link || isSharing) {
      return;
    }

    if (/\s/.test(link)) {
      console.error("Refusing to share URL with raw spaces:", link);
      return;
    }

    setIsSharing(true);
    try {
      const liff = await getCurrentLiffClient();
      if (liff.isInClient() && typeof liff.openWindow === "function") {
        // react-share uses window.open — blocked / broken in LINE iOS WKWebView.
        liff.openWindow({ url: link, external: true });
        return;
      }
    } catch {
      // Not in LIFF / init failed.
    } finally {
      setIsSharing(false);
    }

    // Reliable on iOS after an async click handler.
    window.location.assign(link);
  }

  if (!shareUrl) {
    return (
      <button type="button" className={classes} disabled aria-label={label}>
        <span className="sonyButton__icon">
          <FacebookIcon />
        </span>
        <span className="sonyButton__label">{label}</span>
      </button>
    );
  }

  return (
    <FacebookShareButton
      url={shareUrl}
      hashtag={hashtag}
      className={classes}
      disabled={disabled}
      resetButtonStyle={false}
      openShareDialogOnClick={false}
      aria-label={label}
      onClick={(event, link) => {
        void handleShare(event, link);
      }}
    >
      <span className="sonyButton__icon">
        <FacebookIcon />
      </span>
      <span className="sonyButton__label">{label}</span>
    </FacebookShareButton>
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
