/* eslint-disable @next/next/no-img-element -- Badge hero image comes from mock/page data. */
type ProductBadgeHeroProps = {
  imageUrl: string;
  title: string;
};

export function ProductBadgeHero({ imageUrl, title }: ProductBadgeHeroProps): JSX.Element {
  return (
    <div className="productBadgeHero">
      <img className="productBadgeHero__image" src={imageUrl} alt={title} />
    </div>
  );
}
