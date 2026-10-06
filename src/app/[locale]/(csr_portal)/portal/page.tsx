import { headers } from "next/headers";
import PortalPageContainer from "@/components/portal/PageContainer";
import { PortalFooter } from "@/components/portal/PortalFooter";
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
} from "@/lib/cs-portal/content-repository";
import { toProductCards } from "@/lib/cs-portal/portal-product-cards";
import { groupPortalProducts } from "@/lib/cs-portal/product-groups";
import {
  getPortalProducts,
  PortalProductsUnavailableError,
} from "@/lib/cs-portal/products";
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
  | { kind: "empty"; title: string; message?: string }
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

function linkAccountHref(): string {
  return (
    process.env.NEXT_PUBLIC_ACCOUNT_URL?.trim() ||
    process.env.NEXT_PUBLIC_REGISTER_PRODUCT_URL?.trim() ||
    "https://stg.mysony.sony-asia.com/th/line/chooselanguage"
  );
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
        actionHref: linkAccountHref(),
      };
    }
    if (!result.products.length) {
      return {
        kind: "empty",
        title: result.emptyState?.title[locale] ?? copy.emptyTitle,
        message: result.emptyState?.message[locale],
      };
    }
    const catalog = await loadActiveProductCatalog();
    const groups = groupPortalProducts(result.products, {
      products: catalog,
      contents: [],
    });
    const modelKeys = groups.map((group) => group.modelKey);
    const dataset = await loadPortalContentDataset(modelKeys);
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

function PortalStatus({
  view,
}: {
  view: Exclude<PortalProductsView, { kind: "products" | "not_linked" }>;
}): JSX.Element {
  if (view.kind === "error") {
    return <p>{view.message}</p>;
  }

  return (
    <>
      <p>{view.title}</p>
      {view.message ? <p>{view.message}</p> : null}
    </>
  );
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

  return (
    <div className="portalProductList" aria-label={copy.productsAriaLabel}>
      <PortalStatus view={view} />
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
