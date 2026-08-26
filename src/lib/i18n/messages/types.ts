export type MissionSectionMessages = {
  title: string;
  /** Optional two-line title for my-badges collection cards. Falls back to `title`. */
  badgeTitle?: string;
  description: string;
};

export type Messages = {
  meta: {
    title: string;
    description: string;
  };
  shareOg: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  loading: {
    title: string;
    message: string;
  };
  errors: {
    accessBlocked: {
      title: string;
      message: string;
    };
    dataUnavailable: {
      title: string;
      message: string;
      fallback: string;
    };
    cacheValidation: string;
  };
  profile: {
    label: string;
    lineConnected: string;
    sonyConnected: string;
    cache: string;
  };
  shelf: {
    ariaLabel: string;
    badgeAlt: string;
    fallbackCategory: string;
    fallbackGroup: string;
  };
  support: {
    title: string;
    ownedProducts: string;
  };
  dateWindow: {
    always: string;
    any: string;
    to: string;
  };
  liff: {
    checkingSession: string;
    mockMode: string;
    initializing: string;
    runningInLine: string;
    initError: string;
    verifying: string;
    continue: string;
    sessionError: string;
  };
  language: {
    label: string;
    th: string;
    en: string;
  };
  bottomBar: {
    ariaLabel: string;
    home: string;
    register: string;
    inquiry: string;
  };
  myBadges: {
    meta: {
      title: string;
      description: string;
    };
    productBadges: string;
    missionBadges: string;
    myProductBadges: string;
    myMissionBadges: string;
    viewAll: string;
    empty: string;
    close: string;
  };
  myProducts: {
    meta: {
      title: string;
      description: string;
    };
    title: string;
    description: string;
    filterLabel: string;
    backToMyBadges: string;
    empty: string;
    filters: {
      all: string;
      "full-frame-camera": string;
      "prime-lens": string;
      "wide-normal-zoom-lens": string;
      "telephoto-super-telephoto-lens": string;
      "macro-lens": string;
    };
    categories: {
      "full-frame-camera": string;
      "prime-lens": string;
      "wide-normal-zoom-lens": string;
      "telephoto-super-telephoto-lens": string;
      "macro-lens": string;
    };
  };
  myProduct: {
    meta: {
      title: string;
      description: string;
    };
    shareTitle: string;
    receivedTitle: string;
    unlockedOn: string;
    quantity: string;
    serialNumbers: string;
    share: string;
    backToMyBadges: string;
  };
  myMissions: {
    meta: {
      title: string;
      description: string;
    };
    title: string;
    description: string;
    backToMyBadges: string;
    empty: string;
    sections: {
      "portrait-master": MissionSectionMessages;
      "wide-architect": MissionSectionMessages;
      "the-visionary": MissionSectionMessages;
      "trinity-master": MissionSectionMessages;
      "trinity-junior": MissionSectionMessages;
      "all-rounder": MissionSectionMessages;
      "f2-master": MissionSectionMessages;
      "the-magnifier": MissionSectionMessages;
    };
  };
  myMission: {
    meta: {
      title: string;
      description: string;
    };
    shareTitle: string;
    receivedTitle: string;
    unlockedOn: string;
    share: string;
    backToHome: string;
    registerProduct: string;
    ticketMissionTitle: string;
    levels: {
      bronze: string;
      silver: string;
      gold: string;
    };
    completed: string;
    details: string;
    back: string;
  };
};
