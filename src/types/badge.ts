export type BadgeStatus = "earned" | "locked" | "no-badge";

export type BadgeType = "product" | "quest";

export type BadgeRuleType = "tier" | "achievement";

export type SonyOwnedProduct = {
  sku: string;
  modelName: string | null;
  serialNumber: string | null;
  registeredAt: string;
};

export type SonyCustomerProfile = {
  lineuuid: string;
  customerId: string;
  displayName: string;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
};

export type SonyCustomerProducts = {
  customer: SonyCustomerProfile;
  products: SonyOwnedProduct[];
};

export type BadgeThresholdConfig = {
  level: string;
  requiredCount: number;
  imageUrl: string | null;
  lockedImageUrl: string | null;
  displayName: string;
};

export type BadgeRuleConfig = {
  id: number;
  code: string;
  name: string;
  ruleType: BadgeRuleType;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  activeFrom: string | null;
  activeTo: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  skus: string[];
  thresholds: BadgeThresholdConfig[];
};

export type CalculatedBadge = {
  code: string;
  name: string;
  ruleType: BadgeRuleType;
  description: string | null;
  status: BadgeStatus;
  level: string | null;
  displayName: string | null;
  matchedCount: number;
  requiredCount: number;
  remainingCount: number;
  progress: number;
  imageUrl: string | null;
  matchedProducts: SonyOwnedProduct[];
};

export type BadgeShelfItem = {
  code: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: "achieved" | "available";
  visualState: "color" | "dimmed";
};

export type BadgeDisplayItem = {
  level?: string | null;
  code: string;
  name: string;
  type: BadgeType;
  description: string | null;
  status: BadgeStatus;
  progress: number;
  remainingCount: number;
  matchedCount: number;
  requiredCount: number;
  imageUrl: string | null;
  serialNumber: string | null;
  modelName: string | null;
  registrationDate: string | null;
};

export type CustomerBadgeDisplay = {
  customerId: string;
  displayName: string;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
  supportMessage: string;
  badges: BadgeDisplayItem[];
};


export type DebugTrace = {
  dbRules: {
    rules: Array<{
      id: number;
      code: string;
      name: string;
      ruleType: BadgeRuleType;
      sortOrder: number;
      isActive: boolean;
      activeFrom: string | null;
      activeTo: string | null;
      registrationStart: string | null;
      registrationEnd: string | null;
      skus: string[];
      thresholds: Array<{
        level: string;
        displayName: string;
        requiredCount: number;
        imageUrl: string | null;
        lockedImageUrl: string | null;
      }>;
    }>;
  };
  sonyApiMock: {
    customer: {
      lineuuidPresent: boolean;
      customerIdPresent: boolean;
      displayNamePresent: boolean;
      lineDisplayNamePresent: boolean;
      linePictureUrlPresent: boolean;
    };
    products: Array<{
      sku: string;
      modelNamePresent: boolean;
      serialNumberPresent: boolean;
      registeredAtPresent: boolean;
    }>;
  };
  aggregationResult: {
    summary: {
      sourceProductCount: number;
      badgeShelfCount: number;
      detailedBadgeCount: number;
      achievedShelfCount: number;
    };
    badgeShelf: BadgeShelfItem[];
    ruleMatches: Array<{
      code: string;
      name: string;
      status: BadgeStatus;
      matchedCount: number;
      requiredCount: number;
      remainingCount: number;
      progress: number;
      level: string | null;
      serialNumberPresent: boolean;
      modelNamePresent: boolean;
      registrationDatePresent: boolean;
    }>;
    badges: Array<{
      code: string;
      name: string;
      type: BadgeType;
      status: BadgeStatus;
      progress: number;
      matchedCount: number;
      requiredCount: number;
      remainingCount: number;
      level: string | null;
      imageUrl: string | null;
    }>;
  };
};

export type BadgeResultPayload = {
  customer: SonyCustomerProfile;
  products: SonyOwnedProduct[];
  supportMessage: string;
  badges: BadgeDisplayItem[];
  badgeShelf: BadgeShelfItem[];
  debugTrace?: DebugTrace;
};

export type BadgeDisplayRow = {
  customer_id: string;
  display_name: string;
  line_display_name: string | null;
  line_picture_url: string | null;
  support_message: string | null;
  badge_code: string;
  badge_name: string;
  badge_type: BadgeType;
  description: string | null;
  image_url: string | null;
  locked_image_url: string | null;
  required_count: number;
  matched_count: number | null;
  serial_number: string | null;
  model_name: string | null;
  registration_date: string | Date | null;
};
