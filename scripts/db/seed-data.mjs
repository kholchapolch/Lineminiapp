export const appConfig = [
  ["campaign_name", "Sony Badge Pilot"],
  ["badge_rules_version", "2026-07-23-product-images-001"],
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
  "macro-lens": [
    ["SEL100M28GM", "FE 100 mm.F2.8 Macro GM OSS", "/Product Badge/Macro Lens/SEL100M28GM.png"],
    ["SEL90M28G", "FE 90mm F2.8 Macro G OSS", "/Product Badge/Macro Lens/SEL90M28G.png"],
  ],
  "prime-lens": [
    ["SEL30M35", "E 30mm F3.5 Macro", "/Product Badge/Prime Lens/SEL30M35.png"],
    ["SEL135F18GM", "FE 135mm F1.8 GM", "/Product Badge/Prime Lens/SEL135F18GM.png"],
    ["SEL14F18GM", "FE 14mm F1.8 GM", "/Product Badge/Prime Lens/SEL14F18GM.png"],
    ["SEL16F18G", "FE 16mm F1.8 G", "/Product Badge/Prime Lens/SEL16F18G.png"],
    ["SEL20F18G", "FE 20mm F1.8 G", "/Product Badge/Prime Lens/SEL20F18G.png"],
    ["SEL24F14GM", "FE 24mm F1.4 GM", "/Product Badge/Prime Lens/SEL24F14GM.png"],
    ["SEL24F28G", "FE 24mm F2.8 G", "/Product Badge/Prime Lens/SEL24F28G.png"],
    ["SEL35F14GM", "FE 35mm F1.4 GM", "/Product Badge/Prime Lens/SEL35F14GM.png"],
    ["SEL35F18F", "FE 35mm F1.8", "/Product Badge/Prime Lens/SEL35F18F.png"],
    ["SEL50F12GM", "FE 50mm F1.2 GM", "/Product Badge/Prime Lens/SEL50F12GM.png"],
    ["SEL50F14GM", "FE 50mm F1.4 GM", "/Product Badge/Prime Lens/SEL50F14GM.png"],
    ["SEL50M28", "FE 50mm F2.8 Macro", "/Product Badge/Prime Lens/SEL50M28.png"],
    ["SEL85F14GM", "FE 85mm F1.4 GM", "/Product Badge/Prime Lens/SEL85F14GM.png"],
    ["SEL85F14GM2", "FE 85mm F1.4 GM II", "/Product Badge/Prime Lens/SEL85F14GM2.png"],
  ],
  "wide-normal-zoom-lens": [
    ["SEL1655G", "E 16-55mm F2.8 G", "/Product Badge/Wide & Normal Zoom Lens/SEL1655G.png"],
    ["SEL55210", "E 55-210mm F4.5-6.3 OSS", "/Product Badge/Wide & Normal Zoom Lens/SEL55210.png"],
    ["SELP18110G", "E PZ 18-110mm F4 G OSS", "/Product Badge/Wide & Normal Zoom Lens/SELP18110G.png"],
    ["SEL1625G", "FE 16-25mm F2.8 G", "/Product Badge/Wide & Normal Zoom Lens/SEL1625G.png"],
    ["SEL1635GM", "FE 16-35mm F2.8 GM", "/Product Badge/Wide & Normal Zoom Lens/SEL1635GM.png"],
    ["SEL1635GM2", "FE 16-35mm F2.8 GM II", "/Product Badge/Wide & Normal Zoom Lens/SEL1635GM2.png"],
    ["SEL2070G", "FE 20-70mm F4 G", "/Product Badge/Wide & Normal Zoom Lens/SEL2070G.png"],
    ["SEL24105G", "FE 24-105mm F4 G OSS", "/Product Badge/Wide & Normal Zoom Lens/SEL24105G.png"],
    ["SEL2450G", "FE 24-50mm F2.8 G", "/Product Badge/Wide & Normal Zoom Lens/SEL2450G.png"],
    ["SEL2470GM", "FE 24-70mm F2.8 GM", "/Product Badge/Wide & Normal Zoom Lens/SEL2470GM.png"],
    ["SEL2470GM2", "FE 24-70mm F2.8 GM II", "/Product Badge/Wide & Normal Zoom Lens/SEL2470GM2.png"],
    ["SEL2870GM", "FE 28-70mm F2 GM", "/Product Badge/Wide & Normal Zoom Lens/SEL2870GM.png"],
    ["SEL50150GM", "FE 50-150 mm.F2 GM", "/Product Badge/Wide & Normal Zoom Lens/SEL50150GM.png"],
    ["SELC1635G", "FE C 16-35mm T3.1 G", "/Product Badge/Wide & Normal Zoom Lens/SELC1635G.png"],
    ["SELP1635G", "FE PZ 16-35mm F4 G", "/Product Badge/Wide & Normal Zoom Lens/SELP1635G.png"],
    ["SELP28135G", "FE PZ 28-135mm F4 G OSS", "/Product Badge/Wide & Normal Zoom Lens/SELP28135G.png"],
    ["SEL1635Z", "Vario-Tessar T* FE 16-35mm F4 ZA OSS", "/Product Badge/Wide & Normal Zoom Lens/SEL1635Z.png"],
    ["SEL2470Z", "Vario-Tessar T* FE 24-70mm F4 ZA OSS", "/Product Badge/Wide & Normal Zoom Lens/SEL2470Z.png"],
  ],
  "telephoto-super-telephoto-lens": [
    ["SEL70350G", "E 70-350mm F4.5-6.3 G OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL70350G.png"],
    ["SEL100400MC", "FE 100-400 mm.F4.5 GM OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL100400MC.png"],
    ["SEL100400GM", "FE 100-400mm F4.5-5.6 GM OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL100400GM.png"],
    ["SEL200600G", "FE 200-600mm F5.6-6.3 G OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL200600G.png"],
    ["SEL300F28GM", "FE 300mm F2.8 GM OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL300F28GM.png"],
    ["SEL400800G", "FE 400-800 mm.F6.3-8 G OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL400800G.png"],
    ["SEL400F28GM", "FE 400mm F2.8 GM OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL400F28GM.png"],
    ["SEL600F40GM", "FE 600mm F4 GM OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL600F40GM.png"],
    ["SEL70200GM", "FE 70-200mm F2.8 GM OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL70200GM.png"],
    ["SEL70200GM2", "FE 70-200mm F2.8 GM OSS II", "/Product Badge/Telephoto & Super Telephoto Lens/SEL70200GM2.png"],
    ["SEL70200G", "FE 70-200mm F4 G OSS", "/Product Badge/Telephoto & Super Telephoto Lens/SEL70200G.png"],
    ["SEL70200G2", "FE 70-200mm F4 Macro G OSS II", "/Product Badge/Telephoto & Super Telephoto Lens/SEL70200G2.png"],
  ],
  "full-frame-camera": [
    ["ILCE-1M2", "Alpha 1 II", "/Product Badge/Full Frame Camera/ILCE-1M2.png"],
    ["ILCE-9M3", "Alpha 9 III", "/Product Badge/Full Frame Camera/ILCE-9M3.png"],
    ["ILCE-7RM5", "Alpha 7R V", "/Product Badge/Full Frame Camera/ILCE-7RM5.png"],
    ["ILCE-7M5", "Alpha 7 V", "/Product Badge/Full Frame Camera/ILCE-7M5.png"],
    ["ILCE-7M4", "Alpha 7 IV", "/Product Badge/Full Frame Camera/ILCE-7M4.png"],
    ["ILCE-7M3", "Alpha 7 III", "/Product Badge/Full Frame Camera/ILCE-7M3.png"],
    ["ILCE-7CM2", "Alpha 7C II", "/Product Badge/Full Frame Camera/ILCE-7CM2.png"],
    ["ILCE-7C", "Alpha 7C", "/Product Badge/Full Frame Camera/ILCE-7C.png"],
    ["ILCE-7CR", "Alpha 7CR", "/Product Badge/Full Frame Camera/ILCE-7CR.png"],
    ["ILCE-7SM3", "Alpha 7S III", "/Product Badge/Full Frame Camera/ILCE-7SM3.png"],
  ],
};

const DEFAULT_PRODUCT_BADGE_IMAGE = "/mock/my-product/badge-hero.svg";

const productBadgeRules = Object.entries(productModelsByGroup).flatMap(
  ([displayGroupCode, models], groupIndex) =>
    models.map(([modelCode, displayName, imageUrl], modelIndex) => ({
      code: `product-${modelCode.toLowerCase()}`,
      name: displayName,
      badgeType: "product",
      ruleType: "achievement",
      displayCategory: "Product Badge",
      displayGroup: displayGroupCode,
      displayGroupCode,
      productModelCode: modelCode,
      productUrl: null,
      imageUrl: imageUrl ?? DEFAULT_PRODUCT_BADGE_IMAGE,
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
  achievedImageUrl: rule.imageUrl,
  lockedImageUrl: null,
  shareImageUrl: rule.imageUrl,
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
