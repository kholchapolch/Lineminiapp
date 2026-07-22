import { MyProductActions } from "@/components/my-product/MyProductActions";
import { ProductBadgeHero } from "@/components/my-product/ProductBadgeHero";
import { formatUnlockedDate } from "@/lib/my-product/format-unlocked-date";
import type { MyProductDetailData } from "@/lib/my-product/types";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";

type MyProductViewProps = {
  locale: Locale;
  messages: Messages;
  data: MyProductDetailData;
};

export function MyProductView({
  locale,
  messages,
  data,
}: MyProductViewProps): JSX.Element {
  const { product } = data;

  return (
    <div className="myProductPage">
      <main className="myProductPage__content">
        <p className="myProductPage__eyebrow">
          {messages.myProduct.shareTitle}
        </p>

        <ProductBadgeHero
          imageUrl={product.badgeImageUrl}
          title={product.title}
        />

        <section className="myProductPage__details">
          <h1>{messages.myProduct.receivedTitle}</h1>
          <p className="myProductPage__title">{product.title}</p>
          <p className="myProductPage__meta">
            {messages.myProduct.unlockedOn}:{" "}
            {formatUnlockedDate(product.unlockedAt, locale)}
          </p>
          <p className="myProductPage__meta">
            {messages.myProduct.quantity}: {product.quantity}
          </p>
        </section>

        <MyProductActions
          shareLabel={messages.myProduct.share}
          backLabel={messages.myProduct.backToMyBadges}
          backHref={localizedPath(locale, "my-badges")}
        />
      </main>
    </div>
  );
}
