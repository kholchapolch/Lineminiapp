import { headers } from "next/headers";
import PortalPageContainer from "@/components/portal/PageContainer";
import { PortalRegisterScrollUnlock } from "@/components/portal/PortalRegisterScrollUnlock";
import { PortalRegisterView } from "@/components/portal/PortalRegisterView";
import { PortalSessionRefresh } from "@/components/portal/PortalSessionRefresh";
import { PortalSignedOut } from "@/components/portal/PortalSignedOut";
import { loadAppConfig } from "@/lib/app-config";
import { requireLineSession, UnauthorizedError } from "@/lib/auth-session";
import { loadRegisterProductPage } from "@/lib/cs-portal/content-repository";
import {
  PageNotFoundError,
  resolveRegisterProductContent,
} from "@/lib/cs-portal/register-product-page";
import type { PageBlock, RegisterProductPage } from "@/lib/cs-portal/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";

export const dynamic = "force-dynamic";

type RegisterCopy = Messages["portal"]["registerPage"];

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

function firstBlock<T extends PageBlock["type"]>(
  blocks: PageBlock[],
  type: T,
): PageBlock | undefined {
  return blocks.find((block) => block.type === type);
}

function buildRegisterView(
  page: RegisterProductPage,
  copy: RegisterCopy,
): {
  title: string;
  lead: string;
  imageUrl: string | null;
  imageAlt: string;
  benefitsTitle: string;
  benefits: string[];
  registerLabel: string;
  registerHref: string;
} {
  const blocks = page.blocks;
  const image = firstBlock(blocks, "image");
  const heading = firstBlock(blocks, "heading");
  const checklist = firstBlock(blocks, "check_list");
  const linkButton = firstBlock(blocks, "link_button");
  const linkUrl =
    linkButton && "url" in linkButton ? linkButton.url.trim() : "";
  const registerHref =
    linkUrl ||
    process.env.NEXT_PUBLIC_REGISTER_PRODUCT_URL?.trim() ||
    "https://www.sony.co.th/microsite/msr-line-menu/product-register";

  return {
    title: page.title,
    lead: page.lead,
    imageUrl: image && "url" in image ? image.url : null,
    imageAlt: (image && "alt" in image ? image.alt : "") || page.title,
    benefitsTitle: heading && "text" in heading ? heading.text.trim() : "",
    benefits:
      checklist && "items" in checklist && checklist.items.length
        ? checklist.items
        : [],
    registerLabel:
      (linkButton && "label" in linkButton ? linkButton.label.trim() : "") ||
      copy.registerCta,
    registerHref,
  };
}

async function loadCmsRegisterPage(
  locale: Locale,
): Promise<RegisterProductPage | null> {
  try {
    const content = await loadRegisterProductPage(locale);
    return resolveRegisterProductContent(content, locale);
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return null;
    }
    console.error("Failed to load register-product CMS page", error);
    return null;
  }
}

export default async function PortalRegisterPage({
  params,
}: {
  params: { locale: string };
}): Promise<JSX.Element> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "th";
  const messages = getDictionary(locale).portal;
  const session = readPortalSession();
  const page = await loadCmsRegisterPage(locale);
  const homeHref = `/${locale}/portal`;

  return (
    <div className="portalPage portalPage--register">
      <PortalRegisterScrollUnlock />
      <PortalSessionRefresh hasSession={session !== null} />
      <PortalPageContainer>
        {!session ? (
          <PortalSignedOut
            sessionRequired={messages.sessionRequired}
            loadingAriaLabel={messages.loadingProductsAriaLabel}
          />
        ) : page ? (
          <PortalRegisterView
            {...buildRegisterView(page, messages.registerPage)}
            homeLabel={messages.registerPage.homeCta}
            homeHref={homeHref}
          />
        ) : (
          <p>{messages.loadProductsFailed}</p>
        )}
      </PortalPageContainer>
    </div>
  );
}
