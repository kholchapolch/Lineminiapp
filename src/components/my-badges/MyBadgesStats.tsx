type MyBadgesStatsProps = {
  productBadgeCount: number;
  productBadgeTotal: number;
  missionBadgeCount: number;
  missionBadgeTotal: number;
  productLabel: string;
  missionLabel: string;
};

export function MyBadgesStats({
  productBadgeCount,
  productBadgeTotal,
  missionBadgeCount,
  missionBadgeTotal,
  productLabel,
  missionLabel,
}: MyBadgesStatsProps): JSX.Element {
  return (
    <section className="myBadgesStats" aria-label={`${productLabel}, ${missionLabel}`}>
      <div className="myBadgesStats__item">
        <p className="myBadgesStats__value">
          {productBadgeCount}/{productBadgeTotal}
        </p>
        <p className="myBadgesStats__label">{productLabel}</p>
      </div>
      <div className="myBadgesStats__divider" aria-hidden="true" />
      <div className="myBadgesStats__item">
        <p className="myBadgesStats__value">
          {missionBadgeCount}/{missionBadgeTotal}
        </p>
        <p className="myBadgesStats__label">{missionLabel}</p>
      </div>
    </section>
  );
}
