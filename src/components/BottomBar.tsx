"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { HomeNavIcon, InquiryNavIcon, RegisterNavIcon } from "@/components/icons/NavIcons";

export type BottomBarItemId = "home" | "register" | "inquiry";

export type BottomBarLabels = Record<BottomBarItemId, string>;

export type BottomBarProps = {
  ariaLabel?: string;
  activeItem?: BottomBarItemId;
  labels: BottomBarLabels;
  hrefs?: Partial<Record<BottomBarItemId, string>>;
  onItemClick?: (item: BottomBarItemId) => void;
  className?: string;
  showHomeIndicator?: boolean;
};

const ITEMS: Array<{
  id: BottomBarItemId;
  icon: ReactNode;
}> = [
  { id: "home", icon: <HomeNavIcon /> },
  { id: "register", icon: <RegisterNavIcon /> },
  { id: "inquiry", icon: <InquiryNavIcon /> },
];

export function BottomBar({
  ariaLabel = "Main navigation",
  activeItem,
  labels,
  hrefs,
  onItemClick,
  className,
  showHomeIndicator = true,
}: BottomBarProps): JSX.Element {
  const classes = ["bottomBar", className].filter(Boolean).join(" ");

  return (
    <nav className={classes} aria-label={ariaLabel}>
      <div className="bottomBar__items">
        {ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          const href = hrefs?.[item.id];
          const content = (
            <>
              <span className="bottomBar__icon">{item.icon}</span>
              <span className="bottomBar__label">{labels[item.id]}</span>
            </>
          );

          if (href) {
            const isExternal = /^https?:\/\//i.test(href);
            const itemClassName = `bottomBar__item${isActive ? " isActive" : ""}`;

            if (isExternal) {
              return (
                <a
                  key={item.id}
                  href={href}
                  className={itemClassName}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onItemClick?.(item.id)}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={href}
                className={itemClassName}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onItemClick?.(item.id)}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`bottomBar__item${isActive ? " isActive" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onItemClick?.(item.id)}
            >
              {content}
            </button>
          );
        })}
      </div>
      {showHomeIndicator ? <div className="bottomBar__homeIndicator" aria-hidden="true" /> : null}
    </nav>
  );
}
