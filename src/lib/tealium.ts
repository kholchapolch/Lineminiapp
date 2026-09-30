import { LINE_UUID_STORAGE_KEY } from "@/lib/line-session-storage";

declare global {
  interface Window {
    __sonyMemberId?: string;
  }
}

export type TealiumEnvironment = "qa" | "prod";

const TEALIUM_BASE = "https://tags.tiqcdn.com/utag/sony-marketing/sea";
const PROD_HOST = "lineminiapp.sony.co.th";

export function tealiumEnvironment(
  link: string | null | undefined,
  options?: { debug?: boolean },
): TealiumEnvironment {
  if (options?.debug) {
    return "prod";
  }

  return hostnameFromLink(link) === PROD_HOST ? "prod" : "qa";
}

function hostnameFromLink(link: string | null | undefined): string {
  const value = (link ?? "").split(",")[0]?.trim() ?? "";
  if (!value) {
    return "";
  }

  try {
    const url = value.includes("://")
      ? new URL(value)
      : new URL(`http://${value}`);
    return url.hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function tealiumSyncSrc(environment: TealiumEnvironment): string {
  return `${TEALIUM_BASE}/${environment}/utag.sync.js`;
}

export function tealiumAsyncSrc(environment: TealiumEnvironment): string {
  return `${TEALIUM_BASE}/${environment}/utag.js`;
}

export const UTAG_DATA_SCRIPT =
  'var utag_data = { website_platform : "regional:marketing" };';

export const DATA_LAYER_READY_EVENT = "dataLayerReady";

type LineSessionReadiness = "idle" | "loading" | "ready" | "unavailable";

export function shouldDispatchDataLayerReady(input: {
  status: LineSessionReadiness;
  lineUuid: string | null;
  alreadyDispatched: boolean;
}): boolean {
  if (input.alreadyDispatched) {
    return false;
  }

  if (input.status === "idle" || input.status === "loading") {
    return false;
  }

  if (input.status === "ready" && !input.lineUuid) {
    return false;
  }

  return true;
}

export function markSonyDataLayerReady(memberId: string): void {
  window.__sonyMemberId = memberId;
  window.dispatchEvent(new CustomEvent(DATA_LAYER_READY_EVENT));
}

export function isDigitalBadgeHomePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return (
    (segments[0] === "th" || segments[0] === "en") &&
    segments[1] === "my-badges" &&
    segments.length === 2
  );
}

export function sonyDataLayerScript(): string {
  return `if (typeof window.buildSonyDataLayer === 'undefined') {
    window.buildSonyDataLayer = function() {
        var path = window.location.pathname || '';
        var parts = path.split('/').filter(Boolean);
        var language = parts[0] === 'en' ? 'en' : 'th';
        var route = (parts[0] === 'en' || parts[0] === 'th') ? parts.slice(1).join('/') : parts.join('/');
        var pageName = 'home';

        if (route === 'my-missions') {
            pageName = 'quest-list';
        } else if (route.indexOf('my-missions/') === 0 || route.indexOf('my-product/') === 0 || route.indexOf('share/') === 0) {
            pageName = 'badge-detail';
        } else if (route === 'my-products') {
            pageName = 'product-list';
        } else if (route === 'portal' || route.indexOf('portal/') === 0) {
            pageName = 'portal';
        }

        var memberId = '';
        if (typeof window.__sonyMemberId === 'string') {
            memberId = window.__sonyMemberId;
        } else {
            try {
                memberId = window.sessionStorage.getItem('${LINE_UUID_STORAGE_KEY}') || '';
            } catch (e) {}
        }

        var sony = {};
        sony.digitalData = {};

        sony.digitalData.page = {};
        sony.digitalData.page.name = pageName;
        sony.digitalData.page.country = 'TH';
        sony.digitalData.page.language = language;
        sony.digitalData.page.pageTemplate = 'digital-badge';
        sony.digitalData.page.section = 'line';
        sony.digitalData.page.currency = 'THB';

        sony.digitalData.user = {};
        sony.digitalData.user.id = memberId;

        return sony;
    };
}`;
}

export function tealiumAsyncLoader(environment: TealiumEnvironment): string {
  const src = tealiumAsyncSrc(environment);

  return `(function(a,b,c,d){
        a='${src}';
        b=document;c='script';d=b.createElement(c);d.src=a;d.type='text/java'+c;d.async=true;
        a=b.getElementsByTagName(c)[0];a.parentNode.insertBefore(d,a);
    })();`;
}
