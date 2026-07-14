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
  myMissions: {
    meta: {
      title: "My mission badges",
      description: "View mission badge progress and tier goals",
    },
    title: "My mission badges",
    description:
      "Mission badges are earned by completing category quests. Each mission has multiple tiers to unlock.",
    backToMyBadges: "Back to my badges",
    sections: {
      "portrait-master": {
        title: "Portrait Master",
        description:
          "Collect mission badges by registering portrait lenses that match each tier requirement.",
      },
      "wide-architect": {
        title: "Wide Architect",
        description:
          "Collect mission badges by registering wide-angle lenses that match each tier requirement.",
      },
      "the-visionary": {
        title: "The Visionary",
        description:
          "Collect mission badges by registering telephoto lenses that match each tier requirement.",
      },
      "trinity-master": {
        title: "Trinity Master",
        description:
          "Collect mission badges by registering Trinity GM lenses (16-35 / 24-70 / 70-200) that match each tier requirement.",
      },
      "trinity-junior": {
        title: "Trinity Junior",
        description:
          "Collect mission badges by registering Trinity Junior lenses that match each tier requirement.",
      },
      "all-rounder": {
        title: "All Rounder",
        description:
          "Collect mission badges by registering all-rounder lenses that match each tier requirement.",
      },
      "f2-master": {
        title: "F2 Master",
        description:
          "Collect mission badges by registering F2 Master lenses that match each tier requirement.",
      },
      "the-magnifier": {
        title: "The Magnifier",
        description:
          "Collect mission badges by registering macro lenses that match each tier requirement.",
      },
    },
  },
  myMission: {
    meta: {
      title: "Mission badge",
      description: "View mission badge details and progress",
    },
    receivedTitle: "Mission badge received",
    unlockedOn: "Unlocked on",
    share: "Share with friends",
    backToHome: "Back to home",
    registerProduct: "Register product",
    ticketMissionTitle: "Your ticket collection mission",
    productCode: "Product code",
    completed: "Completed",
    details: "Details",
    back: "Back",
  },
};
