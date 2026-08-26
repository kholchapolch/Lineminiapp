"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { FacebookShareButton } from "react-share";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import {
  getPublicAppBaseUrl,
  toFacebookSharerUrl,
  toShareableAssetUrl,
} from "@/lib/absolute-url";
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
  const sharerUrl = toFacebookSharerUrl(shareUrl) ?? "";

  async function handleShare(
    _event: MouseEvent<HTMLButtonElement>,
    link: string,
  ) {
    if (!shareUrl || isSharing) {
      return;
    }

    const facebookLink = toFacebookSharerUrl(shareUrl) ?? link;
    if (!facebookLink) {
      return;
    }

    if (/\s/.test(shareUrl) || /\s/.test(facebookLink)) {
      console.error(
        "Refusing to share URL with raw spaces:",
        shareUrl || facebookLink,
      );
      return;
    }

    setIsSharing(true);
    try {
      // iOS + Facebook app installed breaks facebook.com/sharer links.
      // Prefer the native share sheet; user picks Facebook there.
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
      if (canUseNavigatorShare()) {
        const shared = await shareWithNavigator(shareUrl);
        if (shared) {
          return;
        }
      }

      const liff = await getCurrentLiffClient();
      if (liff.isInClient() && typeof liff.openWindow === "function") {
        liff.openWindow({ url: facebookLink, external: true });
        return;
      }
    } catch {
      // Not in LIFF / init failed.
    } finally {
      setIsSharing(false);
    }

    const opened = window.open(facebookLink, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(facebookLink);
    }
  }

  if (!shareUrl || !sharerUrl) {
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

function canUseNavigatorShare(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

/**
 * Opens the system share sheet. Returns true if handled (including user cancel).
 */
async function shareWithNavigator(url: string): Promise<boolean> {
  try {
    await navigator.share({ url });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }
    console.error("navigator.share failed:", error);
    return false;
  }
}
