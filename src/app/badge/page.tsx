import { LiffStatus } from "@/components/LiffStatus";
import { loadAppConfig } from "@/lib/app-config";
import { getBadgeResultForLineUuid } from "@/lib/badge-result";
import { toSafeError } from "@/lib/safe-logging";

export const dynamic = "force-dynamic";

export default async function BadgePage({
  searchParams,
}: {
  searchParams?: { lineuuid?: string; entryError?: string };
}): Promise<JSX.Element> {
  const config = loadAppConfig();
  const lineuuid = searchParams?.lineuuid?.trim() || config.sonyDemoLineUuid;
  let errorState: { title: string; message: string } | null = null;
  let display = null;

  if (searchParams?.entryError) {
    errorState = {
      title: "Access blocked",
      message: "This badge page can only open from an approved Sony campaign source.",
    };
  } else {
    try {
      display = await getBadgeResultForLineUuid(lineuuid);
    } catch (error) {
      const safeError = toSafeError(error);
      errorState = {
        title:
          safeError.code === "CUSTOMER_NOT_FOUND"
            ? "Customer not found"
            : "Badge data unavailable",
        message: safeError.message,
      };
    }
  }

  return (
    <main className="badgePage">
      <section className="badgeHero">
        <div>
          <p className="badgeEyebrow">Sony Thailand</p>
          <h1>My Badge</h1>
          <p className="badgeLead">
            Product and quest badges for registered Sony products.
          </p>
        </div>
        <LiffStatus />
      </section>

      {!display ? (
        <section className="badgeEmptyState">
          <h2>{errorState?.title ?? "Badge data unavailable"}</h2>
          <p>
            {errorState?.message ??
              "We could not load badge data for this profile. Please try again later."}
          </p>
        </section>
      ) : (
        <>
          <section className="badgeProfilePanel">
            <div className="badgeAvatar" aria-hidden="true">
              {(display.customer.lineDisplayName ?? display.customer.displayName).slice(0, 1)}
            </div>
            <div>
              <p className="badgeProfileLabel">Profile</p>
              <h2>{display.customer.lineDisplayName ?? display.customer.displayName}</h2>
              <p>{display.customer.displayName}</p>
              <p className="badgeProfileMeta">LINE profile connected</p>
            </div>
          </section>

          <section className="badgeGrid" aria-label="Badge list">
            {display.badges.map((badge) => (
              <article className="badgeCard" key={badge.code}>
                <div className={`badgeArt ${badge.status}`}>
                  <span>
                    {badge.status === "earned"
                      ? "Earned"
                      : badge.status === "locked"
                        ? "Locked"
                        : "No badge"}
                  </span>
                </div>
                <div className="badgeContent">
                  <p className="badgeType">{badge.type}</p>
                  <h2>{badge.name}</h2>
                  {badge.description ? <p>{badge.description}</p> : null}

                  <div className="badgeProgressRow">
                    <span>{badge.progress}%</span>
                    <span>
                      {badge.matchedCount}/{badge.requiredCount}
                    </span>
                  </div>
                  <div className="badgeProgressTrack">
                    <div
                      className="badgeProgressFill"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>

                  {badge.status === "no-badge" ? (
                    <p className="badgeNoBadgeText">
                      No eligible product registered yet
                    </p>
                  ) : badge.remainingCount > 0 ? (
                    <p className="badgeRemaining">
                      {badge.remainingCount} more product
                      {badge.remainingCount > 1 ? "s" : ""} needed
                    </p>
                  ) : (
                    <p className="badgeEarnedText">Badge completed</p>
                  )}

                  <dl className="badgeProductMeta">
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

          <section className="badgeSupportBox">
            <h2>Support</h2>
            <p>{display.supportMessage}</p>
            <p className="badgeProfileMeta">Owned products: {display.products.length}</p>
          </section>
        </>
      )}
    </main>
  );
}
