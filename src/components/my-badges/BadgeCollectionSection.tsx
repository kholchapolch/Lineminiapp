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
};

export function BadgeCollectionSection({
  title,
  viewAllLabel,
  viewAllHref,
  badges,
  previewLimit = MY_BADGES_SECTION_PREVIEW_LIMIT,
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
        {previewBadges.map((badge) => (
          <ProductBadgeCard
            key={badge.id}
            className="productBadgeCard--collection"
            title={badge.title}
            imageUrl={badge.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
