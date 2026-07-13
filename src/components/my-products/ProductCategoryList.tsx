import Link from "next/link";
import { ProductBadgeCard } from "@/components/ProductBadgeCard";
import type { Locale } from "@/lib/i18n/locales";
import { localizedProductPath } from "@/lib/i18n/paths";
import type { MyProductCategory } from "@/lib/my-products/types";

export type ProductCategoryView = MyProductCategory & {
  title: string;
};

type ProductCategoryListProps = {
  locale: Locale;
  categories: ProductCategoryView[];
};

export function ProductCategoryList({
  locale,
  categories,
}: ProductCategoryListProps): JSX.Element {
  if (categories.length === 0) {
    return <></>;
  }

  return (
    <div className="productCategoryList">
      {categories.map((category) => (
        <section className="productCategoryList__section" key={category.id}>
          <h2 className="productCategoryList__title">{category.title}</h2>
          <div className="productCategoryList__grid">
            {category.items.map((item) => (
              <Link
                key={item.id}
                className="productCategoryList__cardLink"
                href={localizedProductPath(locale, item.id)}
              >
                <ProductBadgeCard
                  className="productBadgeCard--catalog"
                  title={item.title}
                  imageUrl={item.imageUrl}
                />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
