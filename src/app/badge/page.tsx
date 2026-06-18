/* eslint-disable @next/next/no-img-element -- Badge image URLs are database-configured. */
import { LiffStatus } from "@/components/LiffStatus";
import { loadAppConfig } from "@/lib/app-config";
import { getBadgeArtPresentation } from "@/lib/badge-art";
import { getBadgeResultForLineUuid } from "@/lib/badge-result";
import { isDebugTraceEnabled } from "@/lib/debug-mode";
import { resolveLineUuid } from "@/lib/lineuuid";
import { toSafeError } from "@/lib/safe-logging";

export const dynamic = "force-dynamic";

function formatDebugWindow(start: string | null, end: string | null): string {
  if (!start && !end) {
    return "Always";
  }

  return `${start ?? "open"} to ${end ?? "open"}`;
}

export default async function BadgePage({
  searchParams,
}: {
  searchParams?: { lineuuid?: string; entryError?: string; debug?: string };
}): Promise<JSX.Element> {
  const config = loadAppConfig();
  const resolvedLineUuid = resolveLineUuid({
    appEnv: config.appEnv,
    providedLineUuid: searchParams?.lineuuid,
    demoLineUuid: config.sonyDemoLineUuid,
  });
  let errorState: { title: string; message: string } | null = null;
  let display = null;
  const debugRequested = isDebugTraceEnabled({
    appEnv: config.appEnv,
    debugParam: searchParams?.debug,
  });

  if (searchParams?.entryError) {
    errorState = {
      title: "Access blocked",
      message: "This badge page can only open from an approved Sony campaign source.",
    };
  } else if (!resolvedLineUuid.lineUuid) {
    errorState = {
      title: "LINE profile required",
      message: "Please open this page from the Sony LINE campaign entry point.",
    };
  } else {
    try {
      display = await getBadgeResultForLineUuid(resolvedLineUuid.lineUuid, {
        includeDebugTrace: debugRequested,
      });
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

  const debugEnabled = Boolean(display?.debugTrace);

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

          <section className="badgeShelf" aria-label="Available badge shelf">
            {display.badgeShelf.map((badge) => (
              <article
                className={`badgeShelfItem ${badge.visualState}`}
                key={badge.code}
                title={badge.description}
              >
                {badge.imageUrl ? (
                  <img alt={`${badge.title} badge`} src={badge.imageUrl} />
                ) : null}
                <span>{badge.label}</span>
              </article>
            ))}
          </section>

          <section className="badgeGrid" aria-label="Badge list">
            {display.badges.map((badge) => {
              const art = getBadgeArtPresentation({
                status: badge.status,
                imageUrl: badge.imageUrl,
              });

              return (
                <article className="badgeCard" key={badge.code}>
                  <div
                    className={`badgeArt ${badge.status}${art.isDimmed ? " dimmed" : ""}`}
                  >
                    {art.imageUrl ? (
                      <>
                        <img
                          alt={`${badge.name} badge`}
                          className={art.imageClassName ?? undefined}
                          src={art.imageUrl}
                        />
                        <span className="badgeArtLabel">{art.label}</span>
                      </>
                    ) : (
                      <span>{art.label}</span>
                    )}
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
              );
            })}
          </section>

          <section className="badgeSupportBox">
            <h2>Support</h2>
            <p>{display.supportMessage}</p>
            <p className="badgeProfileMeta">Owned products: {display.products.length}</p>
          </section>

          {debugEnabled && display.debugTrace ? (
            <section className="badgeDebugPanel" aria-label="Debug trace">
              <h2>Debug Trace</h2>

              <section className="debugSection">
                <h3>Rules From DB</h3>
                <div className="debugRuleList">
                  {display.debugTrace.dbRules.rules.map((rule) => (
                    <article className="debugRuleCard" key={rule.code}>
                      <header>
                        <strong>{rule.code}</strong>
                        <span>{rule.ruleType}</span>
                        <span>sort {rule.sortOrder}</span>
                      </header>
                      <p>{rule.name}</p>
                      <dl>
                        <div>
                          <dt>Active window</dt>
                          <dd>{formatDebugWindow(rule.activeFrom, rule.activeTo)}</dd>
                        </div>
                        <div>
                          <dt>Registration window</dt>
                          <dd>
                            {formatDebugWindow(rule.registrationStart, rule.registrationEnd)}
                          </dd>
                        </div>
                        <div>
                          <dt>SKUs</dt>
                          <dd>{rule.skus.join(", ") || "None"}</dd>
                        </div>
                        <div>
                          <dt>Thresholds</dt>
                          <dd>
                            {rule.thresholds
                              .map(
                                (threshold) =>
                                  `${threshold.level}/${threshold.displayName}: ${threshold.requiredCount}`,
                              )
                              .join(", ")}
                          </dd>
                        </div>
                        <div>
                          <dt>Image URLs</dt>
                          <dd>
                            {rule.thresholds
                              .map(
                                (threshold) =>
                                  `${threshold.displayName}: ${threshold.imageUrl ?? "none"}`,
                              )
                              .join(", ")}
                          </dd>
                        </div>
                        <div>
                          <dt>Locked image URLs</dt>
                          <dd>
                            {rule.thresholds
                              .map(
                                (threshold) =>
                                  `${threshold.displayName}: ${threshold.lockedImageUrl ?? "none"}`,
                              )
                              .join(", ")}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>

              <section className="debugSection">
                <h3>Sony API Mock JSON</h3>
                <dl className="debugSummaryGrid">
                  <div>
                    <dt>Products</dt>
                    <dd>{display.debugTrace.sonyApiMock.products.length}</dd>
                  </div>
                  <div>
                    <dt>LINE UUID</dt>
                    <dd>{display.debugTrace.sonyApiMock.customer.lineuuidPresent ? "Present" : "Missing"}</dd>
                  </div>
                </dl>
                <div className="debugProductList">
                  {display.debugTrace.sonyApiMock.products.map((product) => (
                    <article className="debugMiniRow" key={product.sku}>
                      <strong>{product.sku}</strong>
                      <span>model {product.modelNamePresent ? "present" : "missing"}</span>
                      <span>serial {product.serialNumberPresent ? "present" : "missing"}</span>
                      <span>registered {product.registeredAtPresent ? "present" : "missing"}</span>
                    </article>
                  ))}
                </div>
                <details className="debugDetails">
                  <summary>Display-safe Sony JSON</summary>
                  <pre>{JSON.stringify(display.debugTrace.sonyApiMock, null, 2)}</pre>
                </details>
              </section>

              <section className="debugSection">
                <h3>Aggregation Result</h3>
                <dl className="debugSummaryGrid">
                  <div>
                    <dt>Source products</dt>
                    <dd>{display.debugTrace.aggregationResult.summary.sourceProductCount}</dd>
                  </div>
                  <div>
                    <dt>Shelf badges</dt>
                    <dd>{display.debugTrace.aggregationResult.summary.badgeShelfCount}</dd>
                  </div>
                  <div>
                    <dt>Achieved shelf</dt>
                    <dd>{display.debugTrace.aggregationResult.summary.achievedShelfCount}</dd>
                  </div>
                </dl>
                <div className="debugProductList">
                  {display.debugTrace.aggregationResult.ruleMatches.map((badge) => (
                    <article className="debugMiniRow" key={`${badge.code}-${badge.level ?? "none"}`}>
                      <strong>{badge.code}</strong>
                      <span>{badge.status}</span>
                      <span>{badge.matchedCount}/{badge.requiredCount}</span>
                      <span>{badge.progress}%</span>
                      <span>{badge.level ?? "no level"}</span>
                    </article>
                  ))}
                </div>
                <details className="debugDetails">
                  <summary>Computed badge shelf JSON</summary>
                  <pre>{JSON.stringify(display.debugTrace.aggregationResult.badgeShelf, null, 2)}</pre>
                </details>
              </section>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
