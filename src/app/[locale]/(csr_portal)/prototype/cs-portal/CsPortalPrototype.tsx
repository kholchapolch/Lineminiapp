"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./cs-portal-prototype.module.css";
import {
  MOCK_SCENARIOS,
  type PortalContentBlock,
  type PortalCta,
  type PortalProduct,
  type PortalScenario,
} from "@/lib/cs-portal-prototype/mock-engine";
import type { Locale } from "@/lib/i18n/locales";

type CsPortalPrototypeProps = {
  locale: Locale;
  scenario: PortalScenario;
};

const copyByLocale = {
  th: {
    prototype: "PROTOTYPE · LOCAL ONLY",
    controls: "กรณีทดสอบ",
    currentState: "Runtime state",
    homeTitle: "My Product Center",
    hello: "สวัสดี",
    search: "ค้นหารุ่นผลิตภัณฑ์",
    noProductsTitle: "ยังไม่มีผลิตภัณฑ์ที่ลงทะเบียน",
    noProductsBody: "ลงทะเบียนผลิตภัณฑ์เพื่อรับข้อมูล บริการ และสิทธิประโยชน์ที่เหมาะกับคุณ",
    unlinkedTitle: "ยังไม่ได้เชื่อมบัญชี My Sony",
    unlinkedBody: "เข้าสู่ระบบหรือสมัคร My Sony แล้วเชื่อมบัญชีกับ LINE เพื่อดูผลิตภัณฑ์ของคุณ",
    apiErrorTitle: "โหลดข้อมูลไม่สำเร็จ",
    noMatch: "ไม่พบรุ่นที่ค้นหา",
    noContent: "ยังไม่มีเนื้อหาที่จับคู่กับผลิตภัณฑ์นี้",
    serial: "Serial Number",
    warranty: "Warranty Expiry",
    status: "Warranty Status",
    active: "Active",
    expired: "Expired",
    unknown: "Unknown",
    articles: "Articles",
    noArticles: "ยังไม่มีบทความที่เผยแพร่สำหรับหัวข้อนี้",
    close: "ปิด",
    retry: "ลองใหม่",
    linkAccount: "เชื่อมบัญชี My Sony",
    addProduct: "ลงทะเบียนผลิตภัณฑ์",
    home: "หน้าหลัก",
    cases: "กรณีทดสอบ",
    back: "กลับ",
    previous: "ก่อนหน้า",
    next: "ถัดไป",
    external: "เปิดเว็บไซต์ Sony",
  },
  en: {
    prototype: "PROTOTYPE · LOCAL ONLY",
    controls: "Demo scenario",
    currentState: "Runtime state",
    homeTitle: "My Product Center",
    hello: "Hello",
    search: "Search model name",
    noProductsTitle: "No registered products yet",
    noProductsBody: "Register a product to receive relevant content, support and benefits.",
    unlinkedTitle: "My Sony account is not linked",
    unlinkedBody: "Sign in or create a My Sony account, then link it with LINE to see your products.",
    apiErrorTitle: "Unable to load products",
    noMatch: "No matching model",
    noContent: "No mapped content for this product yet.",
    serial: "Serial Number",
    warranty: "Warranty Expiry",
    status: "Warranty Status",
    active: "Active",
    expired: "Expired",
    unknown: "Unknown",
    articles: "Articles",
    noArticles: "No published articles for this action.",
    close: "Close",
    retry: "Retry",
    linkAccount: "Link My Sony account",
    addProduct: "Register product",
    home: "Home",
    cases: "Demo cases",
    back: "Back",
    previous: "Previous",
    next: "Next",
    external: "Open Sony website",
  },
} as const;

function ContentBlocks({
  blocks,
}: {
  blocks: PortalContentBlock[];
}): JSX.Element {
  return (
    <div className={styles.contentBlocks}>
      {blocks.map((block, index) => {
        const key = block.type + "-" + index;

        switch (block.type) {
          case "heading":
            return <h2 key={key}>{block.text}</h2>;
          case "paragraph":
            return <p key={key}>{block.text}</p>;
          case "check_list":
            return (
              <ul key={key} className={styles.checkList}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "image":
            return (
              <Image
                key={key}
                className={styles.registerImage}
                src={block.src}
                alt={block.alt}
                width={640}
                height={360}
                priority
              />
            );
          case "link_button":
            return (
              <a
                key={key}
                className={styles.primaryButton}
                href={block.href}
                target="_blank"
                rel="noreferrer"
              >
                {block.label}
              </a>
            );
        }
      })}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  highlightIndex,
  onHighlightChange,
  onOpenArticles,
}: {
  product: PortalProduct;
  locale: Locale;
  highlightIndex: number;
  onHighlightChange: (nextIndex: number) => void;
  onOpenArticles: (cta: PortalCta) => void;
}): JSX.Element {
  const copy = copyByLocale[locale];
  const highlight = product.highlights[highlightIndex] ?? null;
  const statusCopy =
    product.warrantyStatus === "active"
      ? copy.active
      : product.warrantyStatus === "expired"
        ? copy.expired
        : copy.unknown;

  return (
    <article className={styles.productCard}>
      <div className={styles.productSummary}>
        <Image
          className={styles.productImage}
          src={product.imageSrc}
          alt={product.imageAlt}
          width={108}
          height={80}
        />
        <div className={styles.productMeta}>
          <h2>{product.modelName}</h2>
          <dl>
            <div>
              <dt>{copy.serial}</dt>
              <dd>{product.serialNumber}</dd>
            </div>
            <div>
              <dt>{copy.warranty}</dt>
              <dd>{product.warrantyExpiry ?? "—"}</dd>
            </div>
            <div>
              <dt>{copy.status}</dt>
              <dd className={styles[product.warrantyStatus]}>{statusCopy}</dd>
            </div>
          </dl>
        </div>
      </div>

      {product.ctas.length > 0 ? (
        <div className={styles.ctaGrid} aria-label={product.modelName + " actions"}>
          {product.ctas.map((cta) => (
            <button
              key={cta.key}
              type="button"
              className={styles.ctaButton}
              onClick={() => onOpenArticles(cta)}
            >
              {cta.label}
            </button>
          ))}
        </div>
      ) : null}

      {highlight ? (
        <section className={styles.highlight} aria-label={highlight.eyebrow}>
          <button
            type="button"
            className={styles.carouselArrow}
            aria-label={copy.previous}
            onClick={() =>
              onHighlightChange(
                (highlightIndex - 1 + product.highlights.length) %
                  product.highlights.length,
              )
            }
          >
            ‹
          </button>
          <a href={highlight.href} target="_blank" rel="noreferrer">
            <span>{highlight.eyebrow}</span>
            <strong>{highlight.title}</strong>
            <small>{highlight.description}</small>
          </a>
          <button
            type="button"
            className={styles.carouselArrow}
            aria-label={copy.next}
            onClick={() =>
              onHighlightChange(
                (highlightIndex + 1) % product.highlights.length,
              )
            }
          >
            ›
          </button>
        </section>
      ) : (
        <p className={styles.noContent}>{copy.noContent}</p>
      )}
    </article>
  );
}

function ArticleDialog({
  cta,
  locale,
  onClose,
}: {
  cta: PortalCta;
  locale: Locale;
  onClose: () => void;
}): JSX.Element {
  const copy = copyByLocale[locale];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.dialogBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prototype-article-title"
      >
        <header>
          <div>
            <p>{cta.label}</p>
            <h2 id="prototype-article-title">{copy.articles}</h2>
          </div>
          <button type="button" aria-label={copy.close} onClick={onClose}>
            ×
          </button>
        </header>

        {cta.articles.length > 0 ? (
          <div className={styles.articleList}>
            {cta.articles.map((article) => (
              <a
                key={article.id}
                href={article.href}
                target="_blank"
                rel="noreferrer"
              >
                <span aria-hidden="true">↗</span>
                <div>
                  <strong>{article.title}</strong>
                  <p>{article.summary}</p>
                  <small>{article.publishedAt}</small>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className={styles.emptyDialog}>{copy.noArticles}</p>
        )}

        <button type="button" className={styles.closeButton} onClick={onClose}>
          {copy.close}
        </button>
      </section>
    </div>
  );
}

export function CsPortalPrototype({
  locale,
  scenario,
}: CsPortalPrototypeProps): JSX.Element {
  const copy = copyByLocale[locale];
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<"home" | "register">(scenario.initialView);
  const [query, setQuery] = useState("");
  const [selectedCta, setSelectedCta] = useState<PortalCta | null>(null);
  const [highlightIndexes, setHighlightIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    setView(scenario.initialView);
    setQuery("");
    setSelectedCta(null);
    setHighlightIndexes({});
  }, [scenario.initialView, scenario.resolvedUuid]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return scenario.products;
    }

    return scenario.products.filter((product) =>
      [product.modelName, product.category, product.serialNumber].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, scenario.products]);

  function changeScenario(uuid: string): void {
    router.replace(pathname + "?uuid=" + encodeURIComponent(uuid), {
      scroll: false,
    });
  }

  function scrollToControls(): void {
    document.getElementById("prototype-controls")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.demoLayout}>
        <aside id="prototype-controls" className={styles.controls}>
          <p className={styles.prototypeLabel}>{copy.prototype}</p>
          <h1>Sony CS Portal</h1>
          <label htmlFor="mock-uuid">{copy.controls}</label>
          <select
            id="mock-uuid"
            value={scenario.resolvedUuid}
            onChange={(event) => changeScenario(event.target.value)}
          >
            {MOCK_SCENARIOS.map((item) => (
              <option key={item.uuid} value={item.uuid}>
                {item.uuid} · {item.label}
              </option>
            ))}
          </select>
          <code>?uuid={scenario.requestedUuid}</code>
          <p>{scenario.description}</p>
          <dl>
            <div>
              <dt>{copy.currentState}</dt>
              <dd>{scenario.state}</dd>
            </div>
            <div>
              <dt>Products</dt>
              <dd>{scenario.products.length}</dd>
            </div>
          </dl>
          {scenario.fallbackNotice ? (
            <p className={styles.notice}>{scenario.fallbackNotice}</p>
          ) : null}
          <nav className={styles.localeLinks} aria-label="Prototype language">
            <Link href={"/th/prototype/cs-portal?uuid=" + scenario.requestedUuid}>
              TH
            </Link>
            <Link href={"/en/prototype/cs-portal?uuid=" + scenario.requestedUuid}>
              EN
            </Link>
          </nav>
        </aside>

        <div className={styles.phone}>
          {view === "register" ? (
            <>
              <header className={styles.registerHeader}>
                <button type="button" onClick={() => setView("home")}>
                  ‹ {copy.back}
                </button>
              </header>
              <section className={styles.registerPage}>
                <p className={styles.registerEyebrow}>My Sony</p>
                <h1>{scenario.registerPage.title}</h1>
                <p className={styles.registerLead}>{scenario.registerPage.lead}</p>
                <ContentBlocks blocks={scenario.registerPage.blocks} />
              </section>
            </>
          ) : (
            <>
              <header className={styles.homeHeader}>
                <p>{copy.homeTitle}</p>
                <div className={styles.profile}>
                  <span aria-hidden="true">
                    {scenario.profile?.displayName.slice(0, 1) ?? "?"}
                  </span>
                  <h1>
                    {copy.hello} {scenario.profile?.displayName ?? "Guest"}
                  </h1>
                </div>
              </header>

              {scenario.state === "linked_with_products" ? (
                <section className={styles.productList}>
                  <label className={styles.search}>
                    <span aria-hidden="true">⌕</span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={copy.search}
                    />
                  </label>

                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        locale={locale}
                        highlightIndex={highlightIndexes[product.id] ?? 0}
                        onHighlightChange={(nextIndex) =>
                          setHighlightIndexes((current) => ({
                            ...current,
                            [product.id]: nextIndex,
                          }))
                        }
                        onOpenArticles={setSelectedCta}
                      />
                    ))
                  ) : (
                    <div className={styles.statePanel}>
                      <span aria-hidden="true">⌕</span>
                      <h2>{copy.noMatch}</h2>
                    </div>
                  )}
                </section>
              ) : null}

              {scenario.state === "linked_without_products" ? (
                <section className={styles.statePanel}>
                  <span aria-hidden="true">＋</span>
                  <h2>{copy.noProductsTitle}</h2>
                  <p>{copy.noProductsBody}</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setView("register")}
                  >
                    {copy.addProduct}
                  </button>
                </section>
              ) : null}

              {scenario.state === "unlinked" ? (
                <section className={styles.statePanel}>
                  <span aria-hidden="true">↗</span>
                  <h2>{copy.unlinkedTitle}</h2>
                  <p>{copy.unlinkedBody}</p>
                  <a
                    className={styles.primaryButton}
                    href="https://www.sony.co.th/mysony"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.linkAccount}
                  </a>
                </section>
              ) : null}

              {scenario.state === "upstream_error" ? (
                <section className={styles.statePanel}>
                  <span aria-hidden="true">!</span>
                  <h2>{copy.apiErrorTitle}</h2>
                  <p>{scenario.errorMessage}</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => router.refresh()}
                  >
                    {copy.retry}
                  </button>
                </section>
              ) : null}
            </>
          )}

          <nav className={styles.bottomNav} aria-label="Prototype navigation">
            <button
              type="button"
              className={view === "home" ? styles.activeNav : undefined}
              onClick={() => setView("home")}
            >
              <span aria-hidden="true">⌂</span>
              {copy.home}
            </button>
            <button
              type="button"
              className={view === "register" ? styles.activeNav : undefined}
              onClick={() => setView("register")}
            >
              <span aria-hidden="true">＋</span>
              {copy.addProduct}
            </button>
            <button type="button" onClick={scrollToControls}>
              <span aria-hidden="true">⋯</span>
              {copy.cases}
            </button>
          </nav>
        </div>
      </div>

      {selectedCta ? (
        <ArticleDialog
          cta={selectedCta}
          locale={locale}
          onClose={() => setSelectedCta(null)}
        />
      ) : null}
    </main>
  );
}
