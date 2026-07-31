/* eslint-disable @next/next/no-img-element -- Badge hero image comes from mock/page data. */
type ProductBadgeHeroProps = {
  imageUrl: string;
  title: string;
  /** When set, the image is a normal link (browser default open behavior). */
  href?: string | null;
};

export function ProductBadgeHero({
  imageUrl,
  title,
  href,
}: ProductBadgeHeroProps): JSX.Element {
  const image = (
    <img className="productBadgeHero__image" src={imageUrl} alt={title} />
  );

  return <div className="productBadgeHero">{image}</div>;
}
