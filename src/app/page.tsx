import { LiffStatus } from "@/components/LiffStatus";
import { getCustomerBadgeDisplay } from "@/lib/badge-repository";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: { customerId?: string };
}): Promise<JSX.Element> {
  const customerId =
    searchParams?.customerId ?? process.env.SONY_DEMO_CUSTOMER_ID ?? "demo-earned";
  const display = await getCustomerBadgeDisplay(customerId);

  return (
    <main className="pageShell">
      <section className="hero">
        <div>
          <p className="eyebrow">Sony Thailand</p>
          <h1>My Badge</h1>
          <p className="lead">
            Product and quest badges for registered Sony products.
          </p>
        </div>
        <LiffStatus />
      </section>

      {!display ? (
        <section className="emptyState">
          <h2>Customer not found</h2>
          <p>
            We could not find badge data for this profile. Please check the
            linked customer account or contact support.
          </p>
        </section>
      ) : (
        <>
          <section className="profilePanel">
            <div className="avatar" aria-hidden="true">
              {(display.lineDisplayName ?? display.displayName).slice(0, 1)}
            </div>
            <div>
              <p className="profileLabel">Profile</p>
              <h2>{display.lineDisplayName ?? display.displayName}</h2>
              <p>{display.displayName}</p>
            </div>
          </section>

          <section className="badgeGrid" aria-label="Badge list">
            {display.badges.map((badge) => (
              <article className="badgeCard" key={badge.code}>
                <div className={`badgeArt ${badge.status}`}>
                  {badge.status === "earned"
                    ? "Earned"
                    : badge.status === "locked"
                      ? "Locked"
                      : "No badge"}
                </div>
                <div className="badgeContent">
                  <p className="badgeType">{badge.type}</p>
                  <h2>{badge.name}</h2>
                  {badge.description ? <p>{badge.description}</p> : null}

                  <div className="progressRow">
                    <span>{badge.progress}%</span>
                    <span>
                      {badge.matchedCount}/{badge.requiredCount}
                    </span>
                  </div>
                  <div className="progressTrack">
                    <div
                      className="progressFill"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>

                  {badge.status === "no-badge" ? (
                    <p className="noBadgeText">No eligible product registered yet</p>
                  ) : badge.remainingCount > 0 ? (
                    <p className="remaining">
                      {badge.remainingCount} more product
                      {badge.remainingCount > 1 ? "s" : ""} needed
                    </p>
                  ) : (
                    <p className="earnedText">Badge completed</p>
                  )}

                  <dl className="productMeta">
                    <div>
                      <dt>Model</dt>
                      <dd>{badge.modelName ?? "Pending data"}</dd>
                    </div>
                    <div>
                      <dt>Serial</dt>
                      <dd>{badge.serialNumber ?? "Pending data"}</dd>
                    </div>
                    <div>
                      <dt>Registration</dt>
                      <dd>{badge.registrationDate ?? "Pending data"}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </section>

          <section className="supportBox">
            <h2>Support</h2>
            <p>{display.supportMessage}</p>
          </section>
        </>
      )}
    </main>
  );
}
