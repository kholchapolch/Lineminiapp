import type { Messages } from "@/lib/i18n/messages/types";

export const en: Messages = {
  meta: {
    title: "Sony Badge Pilot",
    description: "Sony Thailand LIFF badge display pilot",
  },
  hero: {
    eyebrow: "Sony Thailand",
    title: "My Badge",
    lead: "Product and quest badges for registered Sony products.",
  },
  loading: {
    title: "Loading badge data",
    message: "Checking Sony products and local badge cache.",
  },
  errors: {
    accessBlocked: {
      title: "Access blocked",
      message: "This badge page can only open from an approved Sony campaign source.",
    },
    dataUnavailable: {
      title: "Badge data unavailable",
      message: "We could not load badge data.",
      fallback: "Badge data unavailable.",
    },
    cacheValidation: "Badge cache could not be validated.",
  },
  profile: {
    label: "Profile",
    lineConnected: "LINE SDK profile connected",
    sonyConnected: "Sony profile connected",
    cache: "cache",
  },
  shelf: {
    ariaLabel: "Available badge shelf",
    badgeAlt: "{title} badge",
    fallbackCategory: "Achievement badge",
    fallbackGroup: "Badges",
  },
  support: {
    title: "Support",
    ownedProducts: "Owned products",
  },
  dateWindow: {
    always: "Always",
    any: "Any",
    to: "to",
  },
  liff: {
    checkingSession: "Checking LIFF session",
    mockMode: "Local preview mode. Set NEXT_PUBLIC_LIFF_ID to test LINE LIFF.",
    initializing: "Initializing LIFF session",
    runningInLine: "Running inside LINE",
    initError: "LIFF could not initialize. Check LIFF ID and endpoint URL.",
    verifying: "Verifying",
    continue: "Continue",
    sessionError: "LINE session could not be verified.",
  },
  language: {
    label: "Language",
    th: "ไทย",
    en: "English",
  },
  bottomBar: {
    ariaLabel: "Main navigation",
    home: "Home",
    register: "Register product",
    inquiry: "Contact us",
  },
  myBadges: {
    meta: {
      title: "My Badges",
      description: "View your product and mission badges",
    },
    productBadges: "Product badges",
    missionBadges: "Mission badges",
    myProductBadges: "My product badges",
    myMissionBadges: "My mission badges",
    viewAll: "View all",
    close: "Close",
  },
  myProducts: {
    meta: {
      title: "My product badges",
      description: "View all product badges earned from Sony product registration",
    },
    title: "My product badges",
    description:
      "Product badges are earned when you register eligible Sony products. Each badge reflects the lens or camera category you own.",
    filterLabel: "Filter by product type",
    backToMyBadges: "Back to my badges",
    filters: {
      all: "All",
      "full-frame-camera": "Full Frame Camera",
      "prime-lens": "Prime Lens",
      "wide-normal-zoom-lens": "Wide & Normal Zoom Lens",
      "telephoto-super-telephoto-lens": "Telephoto & Super Telephoto Lens",
      "macro-lens": "Macro Lens",
    },
    categories: {
      "full-frame-camera": "Full Frame Camera",
      "prime-lens": "Prime Lens",
      "wide-normal-zoom-lens": "Wide & Normal Zoom Lens",
      "telephoto-super-telephoto-lens": "Telephoto & Super Telephoto Lens",
      "macro-lens": "Macro Lens",
    },
  },
  myProduct: {
    meta: {
      title: "Share product badge",
      description: "View details and share your product badge",
    },
    shareTitle: "Share product badge",
    receivedTitle: "Product badge received",
    unlockedOn: "Unlocked on",
    quantity: "Quantity",
    share: "Share with friends",
    backToMyBadges: "Back to my badges",
  },
};
