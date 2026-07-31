import Link from "next/link";
import { ProductBadgeCard } from "@/components/ProductBadgeCard";
import type { MyBadgeItem } from "@/lib/my-badges/types";

export const MY_BADGES_SECTION_PREVIEW_LIMIT = 3;

type BadgeCollectionSectionProps = {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  emptyLabel: string;
  badges: MyBadgeItem[];
  previewLimit?: number;
  getBadgeHref?: (badgeId: string) => string;
  interactive?: boolean;
  overlapImage?: boolean;
};

export function BadgeCollectionSection({
  title,
  viewAllLabel,
  viewAllHref,
  emptyLabel,
  badges,
  previewLimit = MY_BADGES_SECTION_PREVIEW_LIMIT,
  getBadgeHref,
  interactive = true,
  overlapImage = false,
}: BadgeCollectionSectionProps): JSX.Element {
  const previewBadges = badges.slice(0, previewLimit);
  const canNavigate = interactive && Boolean(getBadgeHref);
  const isEmpty = previewBadges.length === 0;
  const sectionClassName = [
    "badgeCollectionSection",
    overlapImage ? "badgeCollectionSection--overlap" : null,
  ]
    .filter(Boolean)
    .join(" ");
  const cardClassName = [
    "productBadgeCard--collection",
    overlapImage ? "productBadgeCard--overlap" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName}>
      <div className="badgeCollectionSection__header">
        <h2 className="badgeCollectionSection__title">{title}</h2>
        {interactive ? (
          <Link className="badgeCollectionSection__viewAll" href={viewAllHref}>
            {viewAllLabel}
          </Link>
        ) : null}
      </div>
      {isEmpty ? (
        <p className="badgeCollectionSection__empty">{emptyLabel}</p>
      ) : (
        <div className="badgeCollectionSection__grid">
          {previewBadges.map((badge) => {
            const card = (
              <ProductBadgeCard
                className={cardClassName}
                title={badge.title}
                imageUrl={badge.imageUrl}
              />
            );

            return canNavigate && getBadgeHref ? (
              <Link key={badge.id} href={getBadgeHref(badge.id)}>
                {card}
              </Link>
            ) : (
              <div key={badge.id}>{card}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}
