/* eslint-disable @next/next/no-img-element -- Product image URLs are supplied by callers. */
import type { ReactNode } from "react";

export type ProductBadgeCardProps = {
  title: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  className?: string;
};

export function ProductBadgeCard({
  title,
  imageUrl,
  imageAlt,
  className,
}: ProductBadgeCardProps): JSX.Element {
  const hasImage = Boolean(imageUrl);
  const classes = [
    "productBadgeCard",
    !hasImage ? "productBadgeCard--empty" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="productBadgeCard__media">
        {hasImage ? (
          <img
            className="productBadgeCard__image"
            src={imageUrl ?? undefined}
            alt={imageAlt ?? (typeof title === "string" ? title : "")}
          />
        ) : (
          <div className="productBadgeCard__placeholder" aria-hidden="true" />
        )}
      </div>
      <p className="productBadgeCard__title">{title}</p>
    </article>
  );
}
