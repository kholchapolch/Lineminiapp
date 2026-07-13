import { ProductBadgeCard } from "@/components/ProductBadgeCard";
import type { MyProductCategory } from "@/lib/my-products/types";

export type ProductCategoryView = MyProductCategory & {
  title: string;
};

type ProductCategoryListProps = {
  categories: ProductCategoryView[];
};

export function ProductCategoryList({ categories }: ProductCategoryListProps): JSX.Element {
  if (categories.length === 0) {
    return <></>;
  }

  return (
    <div className="productCategoryList">
      {categories.map((category) => (
        <section className="productCategoryList__section" key={category.id}>
          <h2 className="productCategoryList__title">{category.title}</h2>
          <div
            className="productCategoryList__grid"
            style={{ gridTemplateColumns: `repeat(${category.columns}, minmax(0, 1fr))` }}
          >
            {category.items.map((item) => (
              <ProductBadgeCard
                key={item.id}
                className="productBadgeCard--catalog"
                title={item.title}
                imageUrl={item.imageUrl}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
