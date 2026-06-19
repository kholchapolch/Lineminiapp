/* eslint-disable @next/next/no-img-element -- Badge image URLs are database-configured. */
import { LiffStatus } from "@/components/LiffStatus";
import { loadAppConfig } from "@/lib/app-config";
import { resolveAuthorizedLineUuid } from "@/lib/auth-session";
import { getBadgeArtPresentation } from "@/lib/badge-art";
import { getBadgeResultForLineUuid } from "@/lib/badge-result";
import { isDebugTraceEnabled } from "@/lib/debug-mode";
import { toSafeError } from "@/lib/safe-logging";
import { headers } from "next/headers";
import type { BadgeShelfItem, DbDebugTable, DbDebugValue } from "@/types/badge";

export const dynamic = "force-dynamic";

function groupBadgeShelf(badges: BadgeShelfItem[]): Array<{
  category: string;
  groups: Array<{ label: string; badges: BadgeShelfItem[] }>;
}> {
  const categories = new Map<string, Map<string, BadgeShelfItem[]>>();

  for (const badge of badges) {
    const category = badge.category ?? "Achievement badge";
    const group = badge.group ?? "Badges";

    if (!categories.has(category)) {
      categories.set(category, new Map());
    }

    const groups = categories.get(category);

    if (!groups?.has(group)) {
      groups?.set(group, []);
    }

    groups?.get(group)?.push(badge);
  }

  return Array.from(categories, ([category, groups]) => ({
    category,
    groups: Array.from(groups, ([label, groupBadges]) => ({ label, badges: groupBadges })),
  }));
}

function getDebugTableColumns(table: DbDebugTable): string[] {
  const columns = new Set<string>();

  for (const row of table.rows) {
    Object.keys(row).forEach((column) => columns.add(column));
  }

  return Array.from(columns);
}

function formatDebugValue(value: DbDebugValue): string {
  if (value === null) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default async function BadgePage({
  searchParams,
}: {
  searchParams?: { lineuuid?: string; entryError?: string; debug?: string };
}): Promise<JSX.Element> {
  const config = loadAppConfig();
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
  } else {
    try {
      const lineuuid = resolveAuthorizedLineUuid({
        config,
        headers: headers(),
        providedLineUuid: searchParams?.lineuuid,
      });

      display = await getBadgeResultForLineUuid(lineuuid, {
        config,
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

          <section className="badgeShelfPanel" aria-label="Available badge shelf">
            {groupBadgeShelf(display.badgeShelf).map((category) => (
              <section className="badgeShelfSection" key={category.category}>
                <h2>{category.category}</h2>
                <div className="badgeShelfGroupGrid">
                  {category.groups.map((group) => (
                    <section className="badgeShelfGroup" key={group.label}>
                      <h3>{group.label}</h3>
                      <div className="badgeShelfGrid">
                        {group.badges.map((badge) => {
                          const art = getBadgeArtPresentation({
                            status: badge.status === "achieved" ? "earned" : "no-badge",
                            imageUrl: badge.imageUrl,
                          });

                          return (
                            <article
                              className={`badgeShelfTile ${badge.visualState}`}
                              key={badge.code}
                              title={badge.description}
                            >
                              {art.imageUrl ? (
                                <img alt={`${badge.title} badge`} src={art.imageUrl} />
                              ) : (
                                <span className="badgeShelfFallback">{badge.label.slice(0, 1)}</span>
                              )}
                              <span>{badge.label}</span>
                              <em>{badge.ruleConditionText}</em>
                              <small>
                                {badge.matchedCount}/{badge.requiredCount} · {badge.progress}%
                              </small>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ))}
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
                <div className="debugTableWrap">
                  <table className="debugTable">
                    <caption>actual_public_db_schema</caption>
                    <thead>
                      <tr>
                        <th>table_name</th>
                        <th>column_name</th>
                        <th>data_type</th>
                        <th>nullable</th>
                        <th>default</th>
                        <th>ordinal_position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {display.debugTrace.dbRules.schema.map((column) => (
                        <tr key={`${column.tableName}-${column.ordinalPosition}`}>
                          <td>{column.tableName}</td>
                          <td>{column.columnName}</td>
                          <td>{column.dataType}</td>
                          <td>{column.isNullable ? "YES" : "NO"}</td>
                          <td>{column.columnDefault ?? "-"}</td>
                          <td>{column.ordinalPosition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {display.debugTrace.dbRules.tables.map((table) => {
                  const columns = getDebugTableColumns(table);

                  return (
                    <div className="debugTableWrap" key={table.tableName}>
                      <table className="debugTable">
                        <caption>{table.tableName}</caption>
                        <thead>
                          <tr>
                            {columns.map((column) => (
                              <th key={`${table.tableName}-${column}`}>{column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIndex) => (
                            <tr key={`${table.tableName}-${rowIndex}`}>
                              {columns.map((column) => (
                                <td key={`${table.tableName}-${rowIndex}-${column}`}>
                                  {formatDebugValue(row[column] ?? null)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
                <div className="debugTableWrap">
                  <table className="debugTable">
                    <caption>badge_shelf_setup</caption>
                    <thead>
                      <tr>
                        <th>badge_code</th>
                        <th>badge_name</th>
                        <th>category</th>
                        <th>group</th>
                        <th>level</th>
                        <th>display_name</th>
                        <th>condition_text</th>
                        <th>status</th>
                        <th>progress</th>
                        <th>matched</th>
                        <th>sku_amount</th>
                        <th>logic_tooltip</th>
                        <th>required_count</th>
                        <th>achieved_image_url</th>
                        <th>locked_image_url</th>
                      </tr>
                    </thead>
                    <tbody>
                      {display.debugTrace.dbRules.badgeShelfSetup.map((row) => (
                        <tr key={`${row.badgeCode}-shelf-${row.level}`} title={row.logicTooltip}>
                          <td>{row.badgeCode}</td>
                          <td>{row.badgeName}</td>
                          <td>{row.category}</td>
                          <td>{row.group ?? "-"}</td>
                          <td>{row.level}</td>
                          <td>{row.displayName}</td>
                          <td>{row.conditionText}</td>
                          <td>{row.status}</td>
                          <td>{row.progress === null ? "-" : `${row.progress}%`}</td>
                          <td>
                            {row.matchedCount === null
                              ? "-"
                              : `${row.matchedCount}/${row.requiredCount}`}
                          </td>
                          <td>{row.skuAmount}</td>
                          <td>{row.logicTooltip}</td>
                          <td>{row.requiredCount}</td>
                          <td>{row.achievedImageUrl ?? "-"}</td>
                          <td>{row.lockedImageUrl ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      <strong>{product.skuLabel}</strong>
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
