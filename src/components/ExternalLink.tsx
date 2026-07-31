"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { getCurrentLiffClient } from "@/lib/liff-session";

type ExternalLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

export function ExternalLink({
  href,
  className,
  children,
  onClick,
  ...props
}: ExternalLinkProps): JSX.Element {
  async function handleClick(event: MouseEvent<HTMLAnchorElement>): Promise<void> {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();

    try {
      const liff = await getCurrentLiffClient();
      if (liff.isInClient() && typeof liff.openWindow === "function") {
        liff.openWindow({ url: href, external: true });
        return;
      }
    } catch {
      // Not in LIFF / init failed — fall through to browser open.
    }

    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(href);
    }
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
