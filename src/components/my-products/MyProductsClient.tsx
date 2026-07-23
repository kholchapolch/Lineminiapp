"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterDropdown } from "@/components/FilterDropdown";
import { ProductCategoryList } from "@/components/my-products/ProductCategoryList";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";
import {
  PRODUCT_FILTER_IDS,
  type MyProductsData,
  type ProductFilterId,
} from "@/lib/my-products/types";

type MyProductsClientProps = {
  locale: Locale;
  messages: Messages;
  data: MyProductsData;
};

export function MyProductsClient({
  locale,
  messages,
  data,
}: MyProductsClientProps): JSX.Element {
  const [filterId, setFilterId] = useState<ProductFilterId>("all");

  const filterOptions = useMemo(
    () =>
      PRODUCT_FILTER_IDS.map((id) => ({
        id,
        label: messages.myProducts.filters[id],
      })),
    [messages.myProducts.filters],
  );

  const visibleCategories = useMemo(
    () =>
      data.categories
        .filter((category) => filterId === "all" || category.id === filterId)
        .map((category) => ({
          ...category,
          title: messages.myProducts.categories[category.id],
        })),
    [data.categories, filterId, messages.myProducts.categories],
  );

  return (
    <div className="myProductsPage">
      <main className="myProductsPage__content">
        <header className="myProductsPage__header">
          <h1>{messages.myProducts.title}</h1>
          <div className="myProductsPage__description">
            <p>{messages.myProducts.description}</p>
          </div>
        </header>

        <FilterDropdown
          ariaLabel={messages.myProducts.filterLabel}
          options={filterOptions}
          value={filterId}
          onChange={(value) => setFilterId(value as ProductFilterId)}
        />

        <ProductCategoryList locale={locale} categories={visibleCategories} />

        <div className="myProductsPage__footer">
          <Link
            className="sonyButton sonyButton--outline myProductsPage__back"
            href={localizedPath(locale, "my-badges")}
          >
            {messages.myProducts.backToMyBadges}
          </Link>
        </div>
      </main>
    </div>
  );
}
