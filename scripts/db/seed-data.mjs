export const appConfig = [
  ["campaign_name", "Sony Badge Pilot"],
  ["badge_rules_version", "2026-07-20-confirmed-badge-rules-001"],
  ["support_message", "Please contact Sony Thailand support if badge data looks incorrect."],
];

export const badgeDisplayGroups = [
  ["full-frame-camera", "product", "Full Frame Camera", 10],
  ["prime-lens", "product", "Prime Lens", 20],
  ["wide-normal-zoom-lens", "product", "Wide & Normal Zoom Lens", 30],
  ["telephoto-super-telephoto-lens", "product", "Telephoto & Super Telephoto Lens", 40],
  ["macro-lens", "product", "Macro Lens", 50],
  ["quest", "quest", "Quest Badge", 100],
].map(([code, badgeType, displayName, sortOrder]) => ({
  code,
  badgeType,
  displayName,
  sortOrder,
}));

const productModelsByGroup = {
  "macro-lens": ["SEL100M28GM", "SEL90M28G"],
  "prime-lens": [
    "SEL30M35", "SEL135F18GM", "SEL14F18GM", "SEL16F18G", "SEL20F18G",
    "SEL24F14GM", "SEL24F28G", "SEL35F14GM", "SEL35F18F", "SEL50F12GM",
    "SEL50F14GM", "SEL50M28", "SEL85F14GM", "SEL85F14GM2",
  ],
  "wide-normal-zoom-lens": [
    "SEL1655G", "SEL55210", "SELP18110G", "SEL1625G", "SEL1635GM", "SEL1635GM2",
    "SEL2070G", "SEL24105G", "SEL2450G", "SEL2470GM", "SEL2470GM2", "SEL2870GM",
    "SEL50150GM", "SELC1635G", "SELP1635G", "SELP28135G", "SEL1635Z", "SEL2470Z",
  ],
  "telephoto-super-telephoto-lens": [
    "SEL70350G", "SEL100400MC", "SEL100400GM", "SEL200600G", "SEL300F28GM",
    "SEL400800G", "SEL400F28GM", "SEL600F40GM", "SEL70200GM", "SEL70200GM2",
    "SEL70200G", "SEL70200G2",
  ],
  "full-frame-camera": [
    "ILCE-1M2", "ILCE-9M3", "ILCE-7RM5", "ILCE-7M5", "ILCE-7M4", "ILCE-7M3",
    "ILCE-7CM2", "ILCE-7C", "ILCE-7CR", "ILCE-7SM3",
  ],
};

const productBadgeRules = Object.entries(productModelsByGroup).flatMap(
  ([displayGroupCode, models], groupIndex) =>
    models.map((modelCode, modelIndex) => ({
      code: `product-${modelCode.toLowerCase()}`,
      name: modelCode,
      badgeType: "product",
      ruleType: "achievement",
      displayCategory: "Product Badge",
      displayGroup: displayGroupCode,
      displayGroupCode,
      productModelCode: modelCode,
      productUrl: null,
      description: `Register ${modelCode} to unlock this Product Badge.`,
      sortOrder: groupIndex * 100 + modelIndex + 1,
      activeFrom: null,
      activeTo: null,
      registrationStart: null,
      registrationEnd: null,
    })),
);

const questBadgeRules = [
  ["portrait-master", "Portrait Master", "tier", 1000, "Collect unique eligible Portrait Master models."],
  ["wide-architect", "Wide Architect", "tier", 1010, "Collect unique eligible Wide Architect models."],
  ["the-visionary", "The Visionary", "tier", 1020, "Collect unique eligible The Visionary models."],
  ["trinity-master", "Trinity Master", "achievement", 1030, "Own one model from each required G Master family."],
  ["trinity-junior", "Trinity Junior", "achievement", 1040, "Own all three required Trinity Junior models."],
  ["all-rounder", "All Rounder", "achievement", 1050, "Own any three eligible All Rounder models."],
  ["f2-master", "F2 Master", "achievement", 1060, "Own both required F2 Master models."],
  ["the-magnifier", "The Magnifier", "achievement", 1070, "Own any one eligible macro model."],
].map(([code, name, ruleType, sortOrder, description]) => ({
  code,
  name,
  badgeType: "quest",
  ruleType,
  displayCategory: "Quest Badge",
  displayGroup: "quest",
  displayGroupCode: "quest",
  productModelCode: null,
  productUrl: null,
  description,
  sortOrder,
  activeFrom: null,
  activeTo: null,
  registrationStart: null,
  registrationEnd: null,
}));

export const badgeRules = [...productBadgeRules, ...questBadgeRules];

const productThresholds = productBadgeRules.map((rule) => ({
  ruleCode: rule.code,
  level: "achievement",
  displayName: rule.name,
  requiredCount: 1,
  achievedImageUrl: "/mock/my-product/badge-hero.svg",
  lockedImageUrl: null,
  shareImageUrl: "/mock/my-product/badge-hero.svg",
  sortOrder: rule.sortOrder,
}));

const questThresholds = [
  ["portrait-master", "bronze", "Portrait Master Bronze", 2, 1001],
  ["portrait-master", "silver", "Portrait Master Silver", 3, 1002],
  ["portrait-master", "gold", "Portrait Master Gold", 4, 1003],
  ["wide-architect", "bronze", "Wide Architect Bronze", 3, 1011],
  ["wide-architect", "silver", "Wide Architect Silver", 4, 1012],
  ["wide-architect", "gold", "Wide Architect Gold", 5, 1013],
  ["the-visionary", "bronze", "The Visionary Bronze", 2, 1021],
  ["the-visionary", "silver", "The Visionary Silver", 3, 1022],
  ["the-visionary", "gold", "The Visionary Gold", 4, 1023],
  ["trinity-master", "achievement", "Trinity Master", 3, 1031],
  ["trinity-junior", "achievement", "Trinity Junior", 3, 1041],
  ["all-rounder", "achievement", "All Rounder", 3, 1051],
  ["f2-master", "achievement", "F2 Master", 2, 1061],
  ["the-magnifier", "achievement", "The Magnifier", 1, 1071],
].map(([ruleCode, level, displayName, requiredCount, sortOrder]) => ({
  ruleCode,
  level,
  displayName,
  requiredCount,
  achievedImageUrl: `/mock/my-missions/tier-${level === "bronze" ? "medal" : level === "silver" ? "shield" : "frame"}.svg`,
  lockedImageUrl: null,
  shareImageUrl: null,
  sortOrder,
}));

export const badgeThresholds = [...productThresholds, ...questThresholds];

const productConditions = productBadgeRules.map((rule) => ({
  ruleCode: rule.code,
  label: `Own ${rule.productModelCode}`,
  matchType: "any",
  requiredCount: 1,
  sonySkus: [rule.productModelCode],
}));

const questConditions = [
  ["portrait-master", "Collect eligible Portrait Master models", "min_count", 4, ["SEL35F14GM", "SEL50F14GM", "SEL50F12GM", "SEL85F14GM", "SEL85F14GM2", "SEL100M28GM", "SEL135F18GM"]],
  ["wide-architect", "Collect eligible Wide Architect models", "min_count", 5, ["SEL1224GM", "SEL14F18GM", "SEL16F18G", "SEL20F18G", "SEL1625G", "SEL1635GM", "SEL1635GM2", "SEL1635Z", "SEL2470GM", "SEL2470GM2", "SEL2450G", "SELC1635G", "SEL1655G", "SEL2070G", "SEL24105G", "SEL2470Z", "SEL24F14GM", "SEL24F28G", "SEL2870GM", "SEL35F14GM", "SEL35F18F", "SELP1635G", "SELP18110G", "SELP28135G"]],
  ["the-visionary", "Collect eligible The Visionary models", "min_count", 4, ["SEL100400GM", "SEL400800G", "SEL200600G", "SEL300F28GM", "SEL400F28GM", "SEL600F40GM", "SEL70350G", "SEL55210", "SEL100400MC"]],
  ["trinity-master", "Own one 16-35 GM family model", "any", 1, ["SEL1635GM", "SEL1635GM2"]],
  ["trinity-master", "Own one 24-70 GM family model", "any", 1, ["SEL2470GM", "SEL2470GM2"]],
  ["trinity-master", "Own one 70-200 GM family model", "any", 1, ["SEL70200GM", "SEL70200GM2"]],
  ["trinity-junior", "Own all Trinity Junior models", "all", 3, ["SEL2450G", "SEL1625G", "SEL70200G2"]],
  ["all-rounder", "Own any three All Rounder models", "min_count", 3, ["SEL2070G", "SELP1635G", "SEL1635Z", "SEL70200G"]],
  ["f2-master", "Own both F2 Master models", "all", 2, ["SEL2870GM", "SEL50150GM"]],
  ["the-magnifier", "Own any one macro model", "any", 1, ["SEL100M28GM", "SEL90M28G", "SEL50M28", "SEL30M35"]],
].map(([ruleCode, label, matchType, requiredCount, sonySkus]) => ({
  ruleCode,
  label,
  matchType,
  requiredCount,
  sonySkus,
}));

export const badgeConditions = [...productConditions, ...questConditions];
