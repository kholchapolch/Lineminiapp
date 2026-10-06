"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PortalBox from "@/components/portal/PortalBox";
import {
  PortalBottomSheet,
  type PortalBottomSheetTab,
} from "@/components/portal/PortalBottomSheet";
import {
  PortalProductCard,
  type PortalProductCardProps,
  type PortalProductCta,
} from "@/components/portal/PortalProductCard";
import type { Messages } from "@/lib/i18n/messages/types";

export function PortalProductList({
  products,
  locale,
  copy,
}: {
  products: PortalProductCardProps[];
  locale: "th" | "en";
  copy: Messages["portal"];
}): JSX.Element {
  const router = useRouter();
  const [sheetProductId, setSheetProductId] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState("");

  const sheetProduct = products.find((item) => item.id === sheetProductId) ?? null;

  const sheetTabs = useMemo<PortalBottomSheetTab[]>(() => {
    if (!sheetProduct) {
      return [];
    }

    return sheetProduct.ctas
      .filter((cta) => cta.action.type === "articles")
      .map((cta) => ({
        id: cta.actionKey,
        title: cta.title,
        subtitle: cta.subtitle,
        articles: cta.articles,
      }));
  }, [sheetProduct]);

  function handleCtaClick(product: PortalProductCardProps, cta: PortalProductCta): void {
    if (cta.action.type === "internal") {
      router.push(`/${locale}${cta.action.route}`);
      return;
    }

    if (cta.action.type === "external") {
      window.open(cta.action.url, "_blank", "noopener,noreferrer");
      return;
    }

    setSheetProductId(product.id);
    setActiveTabId(cta.actionKey);
  }

  return (
    <>
      <div className="portalProductList" aria-label={copy.productsAriaLabel}>
        {products.map((product) => (
          <div key={product.id} className="portalProductList__item">
            <PortalBox>
              <PortalProductCard
                {...product}
                ui={copy}
                onCtaClick={(ctaId) => {
                  const cta = product.ctas.find((item) => item.id === ctaId);
                  if (!cta) {
                    return;
                  }
                  handleCtaClick(product, cta);
                }}
                onArticleClick={(articleId) => {
                  const article = product.articles.find(
                    (item) => item.id === articleId,
                  );
                  if (!article?.href) {
                    return;
                  }
                  window.open(article.href, "_blank", "noopener,noreferrer");
                }}
              />
            </PortalBox>
          </div>
        ))}
      </div>
      <PortalBottomSheet
        open={sheetTabs.length > 0}
        tabs={sheetTabs}
        activeTabId={activeTabId}
        onActiveTabChange={setActiveTabId}
        labels={{
          close: copy.close,
          previous: copy.previous,
          next: copy.next,
          articleCategoriesAriaLabel: copy.articleCategoriesAriaLabel,
          articlesEmpty: copy.articlesEmpty,
        }}
        onClose={() => {
          setSheetProductId(null);
          setActiveTabId("");
        }}
      />
    </>
  );
}
