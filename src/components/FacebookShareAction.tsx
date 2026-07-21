"use client";

import { useEffect, useState } from "react";
import { FacebookShareButton as ReactShareFacebookButton } from "react-share";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

type FacebookShareActionProps = {
  label: string;
  /** Absolute URL to share. Defaults to the current page URL. */
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
  const [shareUrl, setShareUrl] = useState(url ?? "");
  // console.log({ shareUrl });

  useEffect(() => {
    if (url) {
      setShareUrl(url);
      return;
    }

    setShareUrl(window.location.href);
  }, [url]);

  const classes = ["sonyButton", "sonyButton--solid", className]
    .filter(Boolean)
    .join(" ");

  return (
    <ReactShareFacebookButton
      url={shareUrl || "about:blank"}
      hashtag={hashtag}
      className={classes}
      resetButtonStyle={false}
      disabled={!shareUrl}
      aria-label={label}
    >
      <span className="sonyButton__icon">
        <FacebookIcon />
      </span>
      <span className="sonyButton__label">{label}</span>
    </ReactShareFacebookButton>
  );
}
