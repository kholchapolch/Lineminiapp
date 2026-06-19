export type BadgeStatus = "earned" | "locked" | "no-badge";

export type BadgeType = "product" | "quest";

export type BadgeRuleType = "tier" | "achievement";

export type BadgeConditionMatchType = "any" | "all" | "min_count";

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
  achievedImageUrl: string | null;
  lockedImageUrl: string | null;
  displayName: string;
  sortOrder?: number;
};

export type BadgeConditionConfig = {
  id: number;
  label: string;
  matchType: BadgeConditionMatchType;
  requiredCount: number;
  sonySkus: string[];
};

export type BadgeRuleConfig = {
  id: number;
  code: string;
  name: string;
  ruleType: BadgeRuleType;
  badgeType?: BadgeType;
  displayCategory?: string;
  displayGroup?: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  activeFrom: string | null;
  activeTo: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  skus: string[];
  thresholds: BadgeThresholdConfig[];
  conditions?: BadgeConditionConfig[];
};

export type CalculatedBadge = {
  code: string;
  name: string;
  ruleType: BadgeRuleType;
  badgeType: BadgeType;
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
  ruleCode: string;
  level: string;
  label: string;
  title: string;
  category?: string;
  group?: string | null;
  description: string;
  ruleConditionText: string;
  imageUrl: string | null;
  status: "achieved" | "available";
  visualState: "color" | "dimmed";
  matchedCount: number;
  requiredCount: number;
  progress: number;
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

export type DbSchemaColumn = {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
  ordinalPosition: number;
};

export type DbDebugValue =
  | string
  | number
  | boolean
  | null
  | DbDebugValue[]
  | { [key: string]: DbDebugValue };

export type DbDebugTable = {
  tableName: string;
  rows: Array<Record<string, DbDebugValue>>;
};

export type DebugBadgeShelfSetupRow = {
  badgeCode: string;
  badgeName: string;
  category: string;
  group: string | null;
  level: string;
  displayName: string;
  conditionText: string;
  status: string;
  progress: number | null;
  matchedCount: number | null;
  requiredCount: number;
  skuAmount: number;
  logicTooltip: string;
  achievedImageUrl: string | null;
  lockedImageUrl: string | null;
};

export type DebugTrace = {
  dbRules: {
    schema: DbSchemaColumn[];
    tables: DbDebugTable[];
    badgeShelfSetup: DebugBadgeShelfSetupRow[];
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
      skuLabel: string;
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
  cache: BadgeCacheMetadata;
};

export type BadgeCacheMetadata = {
  customerCacheKey: string;
  skuHash: string;
  rulesVersion: string;
  calculatedAt: string;
};

export type BadgeApiCacheHitPayload = {
  cacheStatus: "hit";
  customer: Pick<
    SonyCustomerProfile,
    "displayName" | "lineDisplayName" | "linePictureUrl"
  >;
  productCount: number;
  supportMessage: string;
  cache: BadgeCacheMetadata;
};

export type BadgeApiMissPayload = {
  cacheStatus: "miss";
  customer: Pick<
    SonyCustomerProfile,
    "displayName" | "lineDisplayName" | "linePictureUrl"
  >;
  productCount: number;
  supportMessage: string;
  badges: Array<
    Pick<
      BadgeDisplayItem,
      | "code"
      | "name"
      | "type"
      | "description"
      | "status"
      | "progress"
      | "remainingCount"
      | "matchedCount"
      | "requiredCount"
      | "imageUrl"
    > & { level: string | null }
  >;
  badgeShelf: BadgeShelfItem[];
  cache: BadgeCacheMetadata;
  debugTrace?: DebugTrace;
};

export type BadgeApiPayload = BadgeApiCacheHitPayload | BadgeApiMissPayload;
