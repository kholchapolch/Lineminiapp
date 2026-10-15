import "./portal-footer.css";
import type { Messages } from "@/lib/i18n/messages/types";
import type { Locale } from "@/lib/i18n/locales";

export type PortalFooterItemId =
  | "serviceCenter"
  | "repairStatus"
  | "register"
  | "faq";

type PortalFooterItem = {
  id: PortalFooterItemId;
  iconSrc: string;
  href?: string;
  external?: boolean;
};

function buildItems(locale: Locale): PortalFooterItem[] {
  return [
    {
      id: "serviceCenter",
      iconSrc: "/cs-portal-prototype/tab/pin.svg",
      href: "https://www.sony.co.th/microsite/find-sony-authorize-service",
      external: true,
    },
    {
      id: "repairStatus",
      iconSrc: "/cs-portal-prototype/tab/service.svg",
      href: "https://web.sony-asia.com/th/track-repair/",
      external: true,
    },
    {
      id: "register",
      iconSrc: "/cs-portal-prototype/tab/shield.svg",
      href: `/${locale}/portal/register`,
    },
    {
      id: "faq",
      iconSrc: "/cs-portal-prototype/tab/contact_us.svg",
      href: "https://www.sony.co.th/microsite/cs-portal",
    },
  ];
}

function resolveHref(href: string | undefined): string | null {
  if (!href || href === "#") {
    return null;
  }

  return href;
}

export type PortalFooterProps = {
  locale: Locale;
  copy: Messages["portal"]["footer"];
  hrefs?: Partial<Record<PortalFooterItemId, string>>;
};

export function PortalFooter({
  locale,
  copy,
  hrefs,
}: PortalFooterProps): JSX.Element {
  return (
    <nav className="portalFooter" aria-label={copy.ariaLabel}>
      <div className="portalFooter__items">
        {buildItems(locale).map((item) => {
          const href = resolveHref(hrefs?.[item.id] ?? item.href);
          const labels = copy[item.id];
          const external = item.external ?? /^https?:\/\//.test(href ?? "");
          const content = (
            <>
              <span className="portalFooter__iconWrap">
                {/* eslint-disable-next-line @next/next/no-img-element -- Tab icons are local SVGs. */}
                <img className="portalFooter__icon" src={item.iconSrc} alt="" />
              </span>
              <span className="portalFooter__label">
                <span>{labels.title}</span>
                {labels.subtitle ? <span>{labels.subtitle}</span> : null}
              </span>
            </>
          );

          if (href) {
            return (
              <a
                key={item.id}
                href={href}
                className="portalFooter__item"
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {content}
              </a>
            );
          }

          return (
            <button key={item.id} type="button" className="portalFooter__item">
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
