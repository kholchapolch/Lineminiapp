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
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [currentActive, setCurrentActive] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sheetProduct =
    products.find((item) => item.id === activeProductId) ?? null;

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

  const activeTabId = useMemo(() => {
    if (!sheetProduct || sheetTabs.length === 0) {
      return "";
    }

    const selectedCta = sheetProduct.ctas[currentActive - 1];
    if (
      selectedCta &&
      sheetTabs.some((tab) => tab.id === selectedCta.actionKey)
    ) {
      return selectedCta.actionKey;
    }

    return sheetTabs[0]?.id ?? "";
  }, [sheetProduct, sheetTabs, currentActive]);

  function handleCtaClick(
    product: PortalProductCardProps,
    cta: PortalProductCta,
  ): void {
    if (cta.action.type === "internal") {
      router.push(`/${locale}${cta.action.route}`);
      return;
    }

    if (cta.action.type === "external") {
      window.open(cta.action.url, "_blank", "noopener,noreferrer");
      return;
    }

    const index = product.ctas.findIndex((item) => item.id === cta.id);
    setActiveProductId(product.id);
    setCurrentActive(index >= 0 ? index + 1 : 1);
    setSheetOpen(true);
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
                currentActive={
                  product.id === activeProductId ? currentActive : 1
                }
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
        open={sheetOpen && sheetTabs.length > 0}
        tabs={sheetTabs}
        activeTabId={activeTabId}
        onActiveTabChange={(tabId) => {
          if (!sheetProduct) {
            return;
          }
          const index = sheetProduct.ctas.findIndex(
            (item) => item.actionKey === tabId,
          );
          if (index >= 0) {
            setCurrentActive(index + 1);
          }
        }}
        labels={{
          close: copy.close,
          previous: copy.previous,
          next: copy.next,
          articleCategoriesAriaLabel: copy.articleCategoriesAriaLabel,
          articlesEmpty: copy.articlesEmpty,
        }}
        onClose={() => {
          setSheetOpen(false);
        }}
      />
    </>
  );
}
