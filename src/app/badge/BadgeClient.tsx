"use client";

/* eslint-disable @next/next/no-img-element -- Badge image URLs are database-configured. */
import { useEffect, useMemo, useState } from "react";
import { LiffStatus } from "@/components/LiffStatus";
import { getBadgeArtPresentation } from "@/lib/badge-art";
import { createLineSessionFromCurrentLiff } from "@/lib/liff-session";
import type {
  BadgeApiPayload,
  BadgeCacheMetadata,
  BadgeShelfItem,
  DbDebugTable,
  DbDebugValue,
  DebugTrace,
} from "@/types/badge";

const BADGE_CACHE_KEY = "sonyBadgeCache:v1";

type BadgeClientProps = {
  lineuuid?: string;
  debug?: string;
  entryError?: string;
};

type BadgeCacheEntry = {
  cache: BadgeCacheMetadata;
  badgeResult: {
    badges: Extract<BadgeApiPayload, { cacheStatus: "miss" }>["badges"];
    badgeShelf: BadgeShelfItem[];
  };
};

type BadgeDisplayState = {
  customer: BadgeApiPayload["customer"];
  productCount: number;
  supportMessage: string;
  badges: Extract<BadgeApiPayload, { cacheStatus: "miss" }>["badges"];
  badgeShelf: BadgeShelfItem[];
  cache: BadgeCacheMetadata;
  cacheStatus: BadgeApiPayload["cacheStatus"];
  debugTrace?: DebugTrace;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; title: string; message: string }
  | { status: "ready"; display: BadgeDisplayState };

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

function formatDateWindow(start: string | null, end: string | null): string {
  if (!start && !end) {
    return "Always";
  }

  return `${start ?? "Any"} to ${end ?? "Any"}`;
}

function readBadgeCache(): BadgeCacheEntry | null {
  try {
    const raw = window.localStorage.getItem(BADGE_CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<BadgeCacheEntry>) : null;

    if (
      !parsed ||
      typeof parsed.cache?.customerCacheKey !== "string" ||
      typeof parsed.cache.skuHash !== "string" ||
      typeof parsed.cache.rulesVersion !== "string" ||
      !Array.isArray(parsed.badgeResult?.badges) ||
      !Array.isArray(parsed.badgeResult.badgeShelf)
    ) {
      window.localStorage.removeItem(BADGE_CACHE_KEY);
      return null;
    }

    return parsed as BadgeCacheEntry;
  } catch {
    window.localStorage.removeItem(BADGE_CACHE_KEY);
    return null;
  }
}

function writeBadgeCache(entry: BadgeCacheEntry): void {
  try {
    window.localStorage.setItem(BADGE_CACHE_KEY, JSON.stringify(entry));
  } catch {
    window.localStorage.removeItem(BADGE_CACHE_KEY);
  }
}

function cacheMatches(cache: BadgeCacheEntry | null, metadata: BadgeCacheMetadata): boolean {
  return (
    cache?.cache.customerCacheKey === metadata.customerCacheKey &&
    cache.cache.skuHash === metadata.skuHash &&
    cache.cache.rulesVersion === metadata.rulesVersion
  );
}

function toDisplayState(payload: BadgeApiPayload, cacheEntry: BadgeCacheEntry | null): BadgeDisplayState | null {
  if (payload.cacheStatus === "hit") {
    if (!cacheEntry || !cacheMatches(cacheEntry, payload.cache)) {
      return null;
    }

    return {
      customer: payload.customer,
      productCount: payload.productCount,
      supportMessage: payload.supportMessage,
      badges: cacheEntry.badgeResult.badges,
      badgeShelf: cacheEntry.badgeResult.badgeShelf,
      cache: payload.cache,
      cacheStatus: "hit",
    };
  }

  return {
    customer: payload.customer,
    productCount: payload.productCount,
    supportMessage: payload.supportMessage,
    badges: payload.badges,
    badgeShelf: payload.badgeShelf,
    cache: payload.cache,
    cacheStatus: "miss",
    debugTrace: payload.debugTrace,
  };
}

export function BadgeClient({ lineuuid, debug, entryError }: BadgeClientProps): JSX.Element {
  const [state, setState] = useState<LoadState>(() =>
    entryError
      ? {
          status: "error",
          title: "Access blocked",
          message: "This badge page can only open from an approved Sony campaign source.",
        }
      : { status: "loading" },
  );
  const debugRequested = debug === "1";

  useEffect(() => {
    if (entryError) {
      return;
    }

    let active = true;

    async function fetchBadgePayload(cacheEntry: BadgeCacheEntry | null): Promise<{
      response: Response;
      payload: BadgeApiPayload | { code: string; message: string };
    }> {
      const searchParams = new URLSearchParams();

      if (lineuuid) {
        searchParams.set("lineuuid", lineuuid);
      }

      if (debugRequested) {
        searchParams.set("debug", "1");
      }

      const headers = new Headers();

      if (cacheEntry && !debugRequested) {
        headers.set("x-badge-cache-customer-key", cacheEntry.cache.customerCacheKey);
        headers.set("x-badge-cache-sku-hash", cacheEntry.cache.skuHash);
        headers.set("x-badge-cache-rules-version", cacheEntry.cache.rulesVersion);
      }

      const response = await fetch(`/api/customer-products?${searchParams.toString()}`, {
        headers,
        cache: "no-store",
      });
      const payload = (await response.json()) as BadgeApiPayload | { code: string; message: string };

      return { response, payload };
    }

    async function loadBadgeData() {
      const cacheEntry = debugRequested ? null : readBadgeCache();

      try {
        let { response, payload } = await fetchBadgePayload(cacheEntry);

        if (response.status === 401) {
          window.localStorage.removeItem(BADGE_CACHE_KEY);
          await createLineSessionFromCurrentLiff();
          ({ response, payload } = await fetchBadgePayload(null));
        }

        if (!response.ok) {
          throw new Error("message" in payload ? payload.message : "Badge data unavailable.");
        }

        const display = toDisplayState(payload as BadgeApiPayload, cacheEntry);

        if (!display && cacheEntry) {
          window.localStorage.removeItem(BADGE_CACHE_KEY);
          if (active) {
            setState({ status: "loading" });
          }
          return;
        }

        if (!display) {
          throw new Error("Badge cache could not be validated.");
        }

        if (display.cacheStatus === "miss" && !debugRequested) {
          writeBadgeCache({
            cache: display.cache,
            badgeResult: {
              badges: display.badges,
              badgeShelf: display.badgeShelf,
            },
          });
        }

        if (active) {
          setState({ status: "ready", display });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          status: "error",
          title: "Badge data unavailable",
          message: error instanceof Error ? error.message : "We could not load badge data.",
        });
      }
    }

    void loadBadgeData();

    return () => {
      active = false;
    };
  }, [debugRequested, entryError, lineuuid]);

  const display = state.status === "ready" ? state.display : null;
  const debugEnabled = Boolean(display?.debugTrace);
  const groupedShelf = useMemo(
    () => (display ? groupBadgeShelf(display.badgeShelf) : []),
    [display],
  );

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
          <h2>{state.status === "error" ? state.title : "Loading badge data"}</h2>
          <p>
            {state.status === "error"
              ? state.message
              : "Checking Sony products and local badge cache."}
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
              <p className="badgeProfileMeta">
                LINE profile connected · cache {display.cacheStatus}
              </p>
            </div>
          </section>

          <section className="badgeShelfPanel" aria-label="Available badge shelf">
            {groupedShelf.map((category) => (
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
            <p className="badgeProfileMeta">Owned products: {display.productCount}</p>
          </section>

          {debugEnabled && display.debugTrace ? (
            <DebugPanel debugTrace={display.debugTrace} />
          ) : null}
        </>
      )}
    </main>
  );
}

function DebugPanel({ debugTrace }: { debugTrace: DebugTrace }): JSX.Element {
  return (
    <section className="badgeDebugPanel" aria-label="Debug trace">
      <h2>Debug Trace</h2>

      <section className="debugSection">
        <h3>Rules From DB</h3>
        {debugTrace.dbRules.tables.map((table) => {
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
                <th>display_window</th>
                <th>earning_window</th>
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
              {debugTrace.dbRules.badgeShelfSetup.map((row) => (
                <tr key={`${row.badgeCode}-shelf-${row.level}`} title={row.logicTooltip}>
                  <td>{row.badgeCode}</td>
                  <td>{row.badgeName}</td>
                  <td>{row.category}</td>
                  <td>{row.group ?? "-"}</td>
                  <td>{formatDateWindow(row.activeFrom, row.activeTo)}</td>
                  <td>{formatDateWindow(row.registrationStart, row.registrationEnd)}</td>
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
            <dd>{debugTrace.sonyApiMock.products.length}</dd>
          </div>
          <div>
            <dt>LINE UUID</dt>
            <dd>{debugTrace.sonyApiMock.customer.lineuuidPresent ? "Present" : "Missing"}</dd>
          </div>
        </dl>
        <div className="debugProductList">
          {debugTrace.sonyApiMock.products.map((product) => (
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
          <pre>{JSON.stringify(debugTrace.sonyApiMock, null, 2)}</pre>
        </details>
      </section>

      <section className="debugSection">
        <h3>Aggregation Result</h3>
        <dl className="debugSummaryGrid">
          <div>
            <dt>Source products</dt>
            <dd>{debugTrace.aggregationResult.summary.sourceProductCount}</dd>
          </div>
          <div>
            <dt>Shelf badges</dt>
            <dd>{debugTrace.aggregationResult.summary.badgeShelfCount}</dd>
          </div>
          <div>
            <dt>Achieved shelf</dt>
            <dd>{debugTrace.aggregationResult.summary.achievedShelfCount}</dd>
          </div>
        </dl>
        <div className="debugProductList">
          {debugTrace.aggregationResult.ruleMatches.map((badge) => (
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
          <pre>{JSON.stringify(debugTrace.aggregationResult.badgeShelf, null, 2)}</pre>
        </details>
      </section>
    </section>
  );
}
