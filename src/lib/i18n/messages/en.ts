import type { Messages } from "@/lib/i18n/messages/types";

export const en: Messages = {
  meta: {
    title: "Sony Thailand",
    description: "Sony Thailand LIFF badge display pilot",
  },
  shareOg: {
    title: "เหรียญของฉันจาก Sony (My badges from Sony)",
    description:
      "มาดูเหรียญที่ฉันปลดล็อกได้ในแคมเปญนี้! (Check out the badges I unlocked in this campaign!)",
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
      message:
        "This badge page can only open from an approved Sony campaign source.",
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
      description: "View your product and quest badges",
    },
    productBadges: "Product badges",
    missionBadges: "Quest badges",
    myProductBadges: "My Product Badges",
    myMissionBadges: "My Quest Badges",
    viewAll: "View all",
    empty: "No badges yet",
    close: "Close",
  },
  myProducts: {
    meta: {
      title: "My Product Badges",
      description:
        "View all product badges earned from Sony product registration",
    },
    title: "My Product Badges",
    description:
      "Buy eligible Sony lenses and register\nyour products under the campaign terms to earn Badges\nand start collecting your achievements",
    filterLabel: "Filter by product type",
    backToMyBadges: "Back to my badges",
    empty: "No badges yet",
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
    serialNumbers: "Serial numbers",
    share: "Share",
    backToMyBadges: "Back to my badges",
  },
  myMissions: {
    meta: {
      title: "My Quest Badges",
      description: "View quest badge progress and tier goals",
    },
    title: "My Quest Badges",
    description:
      "Buy eligible Sony lenses and register\nyour products under the campaign terms to earn Badges\nand start collecting your achievements",
    backToMyBadges: "Back to my badges",
    empty: "No quest badges yet",
    sections: {
      "portrait-master": {
        title: "Portrait Master",
        description:
          "Collect quest badges by registering portrait lenses that match each tier requirement.",
      },
      "wide-architect": {
        title: "Wide Architect",
        description:
          "Collect quest badges by registering wide-angle lenses that match each tier requirement.",
      },
      "the-visionary": {
        title: "The Visionary",
        description:
          "Collect quest badges by registering telephoto lenses that match each tier requirement.",
      },
      "trinity-master": {
        title: "Trinity Master",
        description:
          "Collect quest badges by registering Trinity GM lenses (16-35 / 24-70 / 70-200) that match each tier requirement.",
      },
      "trinity-junior": {
        title: "Trinity G",
        description:
          "Collect quest badges by registering Trinity G lenses that match each tier requirement.",
      },
      "all-rounder": {
        title: "All Rounder",
        description:
          "Collect quest badges by registering all-rounder lenses that match each tier requirement.",
      },
      "f2-master": {
        title: "F2 Master",
        description:
          "Collect quest badges by registering F2 Master lenses that match each tier requirement.",
      },
      "the-magnifier": {
        title: "The Magnifier",
        description:
          "Collect quest badges by registering macro lenses that match each tier requirement.",
      },
    },
  },
  myMission: {
    meta: {
      title: "Quest badge",
      description: "View quest badge details and progress",
    },
    shareTitle: "Share quest badge",
    receivedTitle: "Quest badge received",
    unlockedOn: "Unlocked on",
    share: "Share",
    backToHome: "Back to home",
    registerProduct: "Register product",
    ticketMissionTitle: "Your mission badge collection quest",
    productCode: "Product code",
    completed: "Completed",
    details: "Details",
    back: "Back",
  },
};
