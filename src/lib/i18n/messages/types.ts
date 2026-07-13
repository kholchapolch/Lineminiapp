export type Messages = {
  meta: {
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
    share: string;
    backToMyBadges: string;
  };
};
