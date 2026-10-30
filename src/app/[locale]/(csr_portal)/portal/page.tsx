import { headers } from "next/headers";
import PortalPageContainer from "@/components/portal/PageContainer";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { PortalEmptyProductsView } from "@/components/portal/PortalEmptyProductsView";
import { PortalNotLinkedView } from "@/components/portal/PortalNotLinkedView";
import { PortalProductList } from "@/components/portal/PortalProductList";
import { PortalSessionHeader } from "@/components/portal/PortalSessionHeader";
import { PortalSessionRefresh } from "@/components/portal/PortalSessionRefresh";
import { PortalSignedOut } from "@/components/portal/PortalSignedOut";
import { loadAppConfig } from "@/lib/app-config";
import { requireLineSession, UnauthorizedError } from "@/lib/auth-session";
import {
  loadActiveProductCatalog,
  loadPortalContentDataset,
  loadRegisterProductPage,
} from "@/lib/cs-portal/content-repository";
import { toProductCards } from "@/lib/cs-portal/portal-product-cards";
import { groupPortalProducts } from "@/lib/cs-portal/product-groups";
import {
  getPortalProducts,
  PortalProductsUnavailableError,
} from "@/lib/cs-portal/products";
import {
  PageNotFoundError,
  resolveRegisterProductContent,
  resolveRegisterProductHref,
} from "@/lib/cs-portal/register-product-page";
import { createSonyAccountPlaceholder } from "@/lib/sony-account";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";

export const dynamic = "force-dynamic";

type PortalCopy = Messages["portal"];

type PortalProductsView =
  | { kind: "error"; message: string }
  | {
      kind: "not_linked";
      title: string;
      message: string;
      actionLabel: string;
      actionHref: string;
    }
  | {
      kind: "empty";
      title: string;
      description: string;
      actionLabel: string;
      actionHref: string;
    }
  | { kind: "products"; products: ReturnType<typeof toProductCards> };

function readPortalSession(): { lineuuid: string } | null {
  const config = loadAppConfig();
  const cookie = headers().get("cookie");

  try {
    return requireLineSession({
      config,
      headers: new Headers(cookie ? { cookie } : undefined),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    throw error;
  }
}

async function loadRegisterHref(locale: Locale): Promise<string> {
  try {
    const content = await loadRegisterProductPage(locale);
    return resolveRegisterProductHref(
      resolveRegisterProductContent(content, locale),
    );
  } catch (error) {
    if (!(error instanceof PageNotFoundError)) {
      console.error("Failed to load register-product CMS link", error);
    }
    return resolveRegisterProductHref(null);
  }
}

async function loadPortalProducts(
  lineuuid: string,
  locale: Locale,
  copy: PortalCopy,
): Promise<PortalProductsView> {
  try {
    const config = loadAppConfig();
    const result = await getPortalProducts(config, lineuuid);
    if (result.accountStatus === "not_linked") {
      const placeholder = result.placeholder ?? createSonyAccountPlaceholder();
      return {
        kind: "not_linked",
        title: placeholder.title[locale],
        message: placeholder.message[locale],
        actionLabel: placeholder.action.label[locale],
        actionHref: await loadRegisterHref(locale),
      };
    }
    if (!result.products.length) {
      return {
        kind: "empty",
        title: result.emptyState?.title[locale] ?? copy.emptyTitle,
        description:
          result.emptyState?.message[locale] ?? copy.emptyDescription,
        actionLabel:
          result.emptyState?.action.label[locale] ??
          copy.registerPage.registerCta,
        actionHref: `/${locale}/portal/register`,
      };
    }
    // Catalog/CMS enrichment is best-effort. Owned products already came from Sony;
    // a local DB/tunnel outage must not surface as "failed to load products".
    // Portal cards only include models present in the active Excel/catalog dataset.
    let catalog: Awaited<ReturnType<typeof loadActiveProductCatalog>> = [];
    let dataset: Awaited<ReturnType<typeof loadPortalContentDataset>> = {
      products: [],
      contents: [],
    };
    try {
      catalog = await loadActiveProductCatalog();
      const matchedKeys = groupPortalProducts(result.products, {
        products: catalog,
        contents: [],
      })
        .filter((group) => group.matchedCatalog)
        .map((group) => group.modelKey);
      dataset = await loadPortalContentDataset(matchedKeys);
    } catch {
      catalog = [];
      dataset = { products: [], contents: [] };
    }
    const groups = groupPortalProducts(result.products, {
      products: catalog,
      contents: [],
    }).filter((group) => group.matchedCatalog);
    if (!groups.length) {
      return {
        kind: "empty",
        title: result.emptyState?.title[locale] ?? copy.emptyTitle,
        description:
          result.emptyState?.message[locale] ?? copy.emptyDescription,
        actionLabel:
          result.emptyState?.action.label[locale] ??
          copy.registerPage.registerCta,
        actionHref: `/${locale}/portal/register`,
      };
    }
    const products =
      dataset.products.length > 0
        ? dataset.products
        : groups.map((group) => ({
            external_key: null,
            model_name: group.modelName,
            model_key: group.modelKey,
            category_code: group.categoryCode,
            image_url: group.imageUrl,
            sort_order: 0,
          }));
    return {
      kind: "products",
      products: toProductCards(
        groups,
        { products, contents: dataset.contents },
        locale,
        copy,
      ),
    };
  } catch (error) {
    if (error instanceof PortalProductsUnavailableError) {
      return { kind: "error", message: copy.loadProductsFailed };
    }
    return { kind: "error", message: copy.loadProductsFailed };
  }
}

function PortalProducts({
  view,
  locale,
  copy,
}: {
  view: PortalProductsView;
  locale: Locale;
  copy: PortalCopy;
}): JSX.Element {
  if (view.kind === "products") {
    return (
      <PortalProductList products={view.products} locale={locale} copy={copy} />
    );
  }

  if (view.kind === "not_linked") {
    return (
      <PortalNotLinkedView
        title={view.title}
        message={view.message}
        actionLabel={view.actionLabel}
        actionHref={view.actionHref}
      />
    );
  }

  if (view.kind === "empty") {
    return (
      <PortalEmptyProductsView
        title={view.title}
        description={view.description}
        actionLabel={view.actionLabel}
        actionHref={view.actionHref}
      />
    );
  }

  return (
    <div className="portalProductList" aria-label={copy.productsAriaLabel}>
      <p>{view.message}</p>
    </div>
  );
}

export default async function CSRPortalPage({
  params,
}: {
  params: { locale: string };
}): Promise<JSX.Element> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const copy = getDictionary(locale).portal;
  const session = readPortalSession();
  const view = session
    ? await loadPortalProducts(session.lineuuid, locale, copy)
    : null;
  const showFooter = view?.kind !== "not_linked";

  return (
    <div className="portalPage">
      <PortalSessionHeader profileFallbackName={copy.profileFallbackName} />
      <PortalSessionRefresh hasSession={session !== null} />
      <PortalPageContainer>
        {view ? (
          <PortalProducts view={view} locale={locale} copy={copy} />
        ) : (
          <PortalSignedOut
            sessionRequired={copy.sessionRequired}
            loadingAriaLabel={copy.loadingProductsAriaLabel}
          />
        )}
      </PortalPageContainer>
      {showFooter ? <PortalFooter locale={locale} copy={copy.footer} /> : null}
    </div>
  );
}
