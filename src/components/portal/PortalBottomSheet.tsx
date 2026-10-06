"use client";

import { useEffect, useRef, useState } from "react";
import "./portal-bottom-sheet.css";

export type PortalBottomSheetArticle = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  imageSrc?: string | null;
  href?: string;
};

export type PortalBottomSheetTab = {
  id: string;
  title: string;
  subtitle: string;
  articles: PortalBottomSheetArticle[];
};

export type PortalBottomSheetLabels = {
  close: string;
  previous: string;
  next: string;
  articleCategoriesAriaLabel: string;
  articlesEmpty: string;
};

export type PortalBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  brandTitle?: string;
  brandHandle?: string;
  tabs?: PortalBottomSheetTab[];
  activeTabId?: string;
  onActiveTabChange?: (tabId: string) => void;
  iframeSrc?: string | null;
  labels: PortalBottomSheetLabels;
};

export function PortalBottomSheet({
  open,
  tabs = [],
  activeTabId = "",
  onActiveTabChange,
  onClose,
  brandTitle = "Sony Thailand",
  brandHandle = "sony-thailand",
  iframeSrc = null,
  labels,
}: PortalBottomSheetProps): JSX.Element | null {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isIframeMode = Boolean(iframeSrc);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || isIframeMode) {
      return;
    }

    const node = tabsRef.current;
    if (!node) {
      return;
    }

    function updateScrollState(): void {
      if (!node) {
        return;
      }

      setCanScrollLeft(node.scrollLeft > 4);
      setCanScrollRight(
        node.scrollLeft + node.clientWidth < node.scrollWidth - 4,
      );
    }

    function scrollToActiveTab(): void {
      if (!node) {
        return;
      }

      const activeButton = node.querySelector<HTMLElement>(
        `[data-tab-id="${CSS.escape(activeTabId)}"]`,
      );
      if (!activeButton) {
        return;
      }

      const nextLeft =
        activeButton.offsetLeft -
        (node.clientWidth - activeButton.offsetWidth) / 2;
      node.scrollTo({
        left: Math.max(0, nextLeft),
        behavior: "auto",
      });
      updateScrollState();
    }

    const frame = window.requestAnimationFrame(() => {
      scrollToActiveTab();
    });

    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(frame);
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [open, tabs, activeTabId, isIframeMode]);

  if (!open || (!isIframeMode && !activeTab)) {
    return null;
  }

  function scrollTabs(direction: "left" | "right"): void {
    const node = tabsRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({
      left: direction === "left" ? -180 : 180,
      behavior: "smooth",
    });
  }

  return (
    <div
      className="portalBottomSheetBackdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <section
        className="portalBottomSheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-bottom-sheet-title"
      >
        <header className="portalBottomSheet__header">
          <button
            type="button"
            className="portalBottomSheet__close"
            aria-label={labels.close}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {isIframeMode && iframeSrc ? (
          <div className="portalBottomSheet__iframeWrap">
            <iframe
              className="portalBottomSheet__iframe"
              src={iframeSrc}
              title={brandTitle}
            />
          </div>
        ) : (
          <div className="portalBottomSheet__content">
            <div className="portalBottomSheet__tabsWrap">
              <button
                type="button"
                className="portalBottomSheet__chevron"
                aria-label={labels.previous}
                disabled={!canScrollLeft}
                onClick={() => scrollTabs("left")}
              >
                ‹
              </button>
              <div
                ref={tabsRef}
                className="portalBottomSheet__tabs"
                role="tablist"
                aria-label={labels.articleCategoriesAriaLabel}
              >
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      data-tab-id={tab.id}
                      aria-selected={isActive}
                      className={`portalBottomSheet__tab${isActive ? " isActive" : ""}`}
                      onClick={() => onActiveTabChange?.(tab.id)}
                    >
                      <span>{tab.title}</span>
                      {tab.subtitle ? <span>{tab.subtitle}</span> : null}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="portalBottomSheet__chevron"
                aria-label={labels.next}
                disabled={!canScrollRight}
                onClick={() => scrollTabs("right")}
              >
                ›
              </button>
            </div>

            <div className="portalBottomSheet__sectionTitle">
              <h3>{activeTab.title}</h3>
              {activeTab.subtitle ? <p>{activeTab.subtitle}</p> : null}
            </div>

            <div className="portalBottomSheet__list">
              {activeTab.articles.length > 0 ? (
                activeTab.articles.map((article) => {
                  const content = (
                    <>
                      <div className="portalBottomSheet__thumb">
                        {article.imageSrc ? (
                          /* eslint-disable-next-line @next/next/no-img-element -- Prototype article thumbnails from local assets. */
                          <img src={article.imageSrc} alt="" />
                        ) : null}
                      </div>
                      <div className="portalBottomSheet__itemBody">
                        <strong>{article.title}</strong>
                        <p>{article.description}</p>
                        <time dateTime={article.publishedAt}>
                          {article.publishedAt}
                        </time>
                      </div>
                    </>
                  );

                  if (article.href) {
                    return (
                      <a
                        key={article.id}
                        className="portalBottomSheet__item"
                        href={article.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <article
                      key={article.id}
                      className="portalBottomSheet__item"
                    >
                      {content}
                    </article>
                  );
                })
              ) : (
                <p className="portalBottomSheet__empty">{labels.articlesEmpty}</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
