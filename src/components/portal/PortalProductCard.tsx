"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import "./portal-product-card.css";
import type { PortalBottomSheetArticle } from "@/components/portal/PortalBottomSheet";
import type { Messages } from "@/lib/i18n/messages/types";

export type PortalProductCtaAction =
  | { type: "articles" }
  | { type: "external"; url: string }
  | { type: "internal"; route: "/my-badges" | "/register-product" };

export type PortalProductCta = {
  id: string;
  actionKey: string;
  title: string;
  subtitle: string;
  action: PortalProductCtaAction;
  articles: PortalBottomSheetArticle[];
};

export type PortalRecommendedArticle = {
  id: string;
  title: string;
  description: string;
  imageSrc?: string | null;
  href?: string | null;
  badges?: string[];
};

export type PortalProductCardProps = {
  id: string;
  /** Catalog / content target for this serial's product. */
  modelKey: string;
  targetKey: string;
  modelName: string;
  modelDescription: string;
  imageSrc: string;
  imageAlt: string;
  serialNumber: string;
  registeredAt: string;
  warrantyLabel: string;
  warrantyExpiry: string;
  warrantyStatus: "active" | "expired" | "unknown";
  warrantyStatusLabel: string;
  ctas: PortalProductCta[];
  recommendedTitle: string;
  articles: PortalRecommendedArticle[];
  ui?: Pick<
    Messages["portal"],
    | "previous"
    | "next"
    | "productActionsAriaLabel"
    | "serialBarcodeAriaLabel"
  >;
  onCtaClick?: (ctaId: string) => void;
  onArticleClick?: (articleId: string) => void;
};

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function SerialBarcode({
  value,
  ariaLabel,
}: {
  value: string;
  ariaLabel: string;
}): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = svgRef.current;
    setReady(false);

    if (!node || !value || value === "—") {
      return;
    }

    try {
      JsBarcode(node, value, {
        format: "CODE128",
        displayValue: false,
        background: "transparent",
        lineColor: "#1a1a1a",
        margin: 0,
        height: 28,
        width: 1.2,
      });
      setReady(true);
    } catch {
      setReady(false);
    }
  }, [value]);

  return (
    <>
      <svg
        ref={svgRef}
        className="portalProductCard__serialBarcode"
        role="img"
        aria-label={ariaLabel}
        style={{ display: ready ? undefined : "none" }}
      />
      {!ready ? (
        <svg
          className="portalProductCard__serialIcon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M3 5h2v14H3V5Zm4 0h1v14H7V5Zm3 0h2v14h-2V5Zm4 0h1v14h-1V5Zm3 0h2v14h-2V5Zm4 0h1v14h-1V5Z"
            fill="currentColor"
          />
        </svg>
      ) : null}
    </>
  );
}

export function PortalProductCard({
  modelName,
  modelDescription,
  imageSrc,
  imageAlt,
  serialNumber,
  registeredAt,
  warrantyLabel,
  warrantyExpiry,
  warrantyStatus,
  warrantyStatusLabel,
  ctas,
  recommendedTitle,
  articles,
  ui,
  onCtaClick,
  onArticleClick,
}: PortalProductCardProps): JSX.Element {
  const ctasRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const previousLabel = ui?.previous ?? "Previous";
  const nextLabel = ui?.next ?? "Next";
  const actionsAriaLabel = ui?.productActionsAriaLabel ?? "Product actions";
  const barcodeAriaLabel = fillTemplate(
    ui?.serialBarcodeAriaLabel ?? "Serial barcode {value}",
    { value: serialNumber },
  );

  useEffect(() => {
    const node = ctasRef.current;
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

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [ctas]);

  function scrollCtas(direction: "left" | "right"): void {
    const node = ctasRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({
      left: direction === "left" ? -180 : 180,
      behavior: "smooth",
    });
  }

  return (
    <section className="portalProductCard">
      <div className="portalProductCard__media">
        {/* eslint-disable-next-line @next/next/no-img-element -- Prototype product art from local/public assets. */}
        <img
          className="portalProductCard__image"
          src={imageSrc}
          alt={imageAlt}
        />
      </div>

      <div className="portalProductCard__heading">
        <h2 className="portalProductCard__model">{modelName}</h2>
        <p className="portalProductCard__description">{modelDescription}</p>
      </div>

      <div className="portalProductCard__meta">
        <div className="portalProductCard__serial">
          <SerialBarcode value={serialNumber} ariaLabel={barcodeAriaLabel} />
          <div>
            <p className="portalProductCard__serialNumber">{serialNumber}</p>
            <p className="portalProductCard__registered">{registeredAt}</p>
          </div>
        </div>

        <div className="portalProductCard__warranty">
          <div>
            <p className="portalProductCard__warrantyLabel">{warrantyLabel}</p>
            <p className="portalProductCard__warrantyExpiry">
              {warrantyExpiry}
            </p>
          </div>
          <span
            className={`portalProductCard__status portalProductCard__status--${warrantyStatus}`}
          >
            {warrantyStatusLabel}
          </span>
        </div>
      </div>

      <div className="portalProductCard__ctasWrap">
        <button
          type="button"
          className="portalProductCard__chevron portalProductCard__chevron--left"
          aria-label={previousLabel}
          disabled={!canScrollLeft}
          onClick={() => scrollCtas("left")}
        >
          ‹
        </button>
        <div
          ref={ctasRef}
          className="portalProductCard__ctas"
          aria-label={actionsAriaLabel}
        >
          {ctas.map((cta) => (
            <button
              key={cta.id}
              type="button"
              className="portalProductCard__cta"
              onClick={() => onCtaClick?.(cta.id)}
            >
              <span>{cta.title}</span>
              {cta.subtitle ? <span>{cta.subtitle}</span> : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="portalProductCard__chevron portalProductCard__chevron--right"
          aria-label={nextLabel}
          disabled={!canScrollRight}
          onClick={() => scrollCtas("right")}
        >
          ›
        </button>
      </div>
      {articles.length > 0 ? (
        <>
          <hr className="portalProductCard__divider" />
          <div className="portalProductCard__recommended">
            <h3 className="portalProductCard__recommendedTitle">
              {recommendedTitle}
            </h3>
            <div className="portalProductCard__articles">
              {articles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  className="portalProductCard__article"
                  onClick={() => onArticleClick?.(article.id)}
                >
                  {article.imageSrc || article.badges?.length ? (
                    <div className="portalProductCard__articleMedia">
                      {article.imageSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element -- Catalog carousel images from Sony hosts. */
                        <img src={article.imageSrc} alt="" />
                      ) : null}
                    </div>
                  ) : null}
                  <h4>{article.title}</h4>
                  <p>{article.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
