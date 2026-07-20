import Link from "next/link";
import { ProductBadgeCard } from "@/components/ProductBadgeCard";
import type { MyBadgeItem } from "@/lib/my-badges/types";

export const MY_BADGES_SECTION_PREVIEW_LIMIT = 3;

type BadgeCollectionSectionProps = {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  badges: MyBadgeItem[];
  previewLimit?: number;
  getBadgeHref?: (badgeId: string) => string;
};

export function BadgeCollectionSection({
  title,
  viewAllLabel,
  viewAllHref,
  badges,
  previewLimit = MY_BADGES_SECTION_PREVIEW_LIMIT,
  getBadgeHref,
}: BadgeCollectionSectionProps): JSX.Element {
  const previewBadges = badges.slice(0, previewLimit);

  return (
    <section className="badgeCollectionSection">
      <div className="badgeCollectionSection__header">
        <h2>{title}</h2>
        <Link className="badgeCollectionSection__viewAll" href={viewAllHref}>
          {viewAllLabel}
        </Link>
      </div>
      <div className="badgeCollectionSection__grid">
        {previewBadges.map((badge) => {
          const card = (
            <ProductBadgeCard
              className="productBadgeCard--collection"
              title={badge.title}
              imageUrl={badge.imageUrl}
            />
          );

          return getBadgeHref ? (
            <Link key={badge.id} href={getBadgeHref(badge.id)}>
              {card}
            </Link>
          ) : (
            <div key={badge.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
