import Link from "next/link";
import { ProductBadgeCard } from "@/components/ProductBadgeCard";
import type { MyBadgeItem } from "@/lib/my-badges/types";

type BadgeCollectionSectionProps = {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  badges: MyBadgeItem[];
};

export function BadgeCollectionSection({
  title,
  viewAllLabel,
  viewAllHref,
  badges,
}: BadgeCollectionSectionProps): JSX.Element {
  return (
    <section className="badgeCollectionSection">
      <div className="badgeCollectionSection__header">
        <h2>{title}</h2>
        <Link className="badgeCollectionSection__viewAll" href={viewAllHref}>
          {viewAllLabel}
        </Link>
      </div>
      <div className="badgeCollectionSection__grid">
        {badges.map((badge) => (
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
