import { mkdir, readFile, writeFile } from "node:fs/promises";

const dumpUrl = new URL("../db/uat_sony_table.sql", import.meta.url);
const outputUrl = new URL("./seed-data.mjs", import.meta.url);

const sql = await readFile(dumpUrl, "utf8");

const appConfigRows = parseInsert(sql, "app_config", ["key", "value"]);
const displayGroupRows = parseInsert(sql, "badge_display_groups", [
  "group_code",
  "badge_type",
  "display_name",
  "sort_order",
  "is_active",
]);
const ruleRows = parseInsert(sql, "badge_rules", [
  "id",
  "badge_code",
  "badge_name",
  "badge_type",
  "rule_type",
  "display_category",
  "display_group",
  "display_group_code",
  "product_model_code",
  "product_url",
  "description",
  "sort_order",
  "is_active",
  "active_from",
  "active_to",
  "registration_start",
  "registration_end",
]);
const thresholdRows = parseInsert(sql, "badge_rule_thresholds", [
  "id",
  "badge_rule_id",
  "level",
  "display_name",
  "required_count",
  "achieved_image_url",
  "locked_image_url",
  "share_image_url",
  "sort_order",
]);
const conditionRows = parseInsert(sql, "badge_rule_conditions", [
  "id",
  "badge_rule_id",
  "condition_label",
  "match_type",
  "required_count",
  "sony_skus",
]);

const rulesById = new Map(ruleRows.map((row) => [row.id, row]));
const productRules = ruleRows
  .filter((row) => row.badge_type === "product")
  .sort((left, right) => left.sort_order - right.sort_order);
const questRules = ruleRows
  .filter((row) => row.badge_type === "quest")
  .sort((left, right) => left.sort_order - right.sort_order);

const productRuleIds = new Set(productRules.map((row) => row.id));
const sel1224 = productRules.find((row) => row.product_model_code === "SEL1224GM");

const normalizedConditions = conditionRows.map((row) => {
  if (
    sel1224 &&
    row.condition_label === "Own SEL1224GM" &&
    row.badge_rule_id !== sel1224.id
  ) {
    return { ...row, badge_rule_id: sel1224.id };
  }

  return row;
});

const generated = renderSeedData({
  appConfigRows,
  displayGroupRows,
  productRules,
  questRules,
  thresholdRows,
  conditionRows: normalizedConditions,
  productRuleIds,
  rulesById,
});

await mkdir(new URL(".", outputUrl), { recursive: true });
await writeFile(outputUrl, generated, "utf8");
console.log(`Generated ${outputUrl.pathname}`);

function parseInsert(source, tableName, columns) {
  const match = source.match(
    new RegExp(
      `INSERT INTO \`${tableName}\` \\([^)]+\\) VALUES\\s*([\\s\\S]*?);`,
    ),
  );

  if (!match) {
    throw new Error(`Could not find INSERT INTO ${tableName}`);
  }

  return parseTuples(match[1]).map((values) => {
    if (values.length !== columns.length) {
      throw new Error(
        `${tableName} row has ${values.length} values, expected ${columns.length}`,
      );
    }

    return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
  });
}

function parseTuples(valuesSql) {
  const rows = [];
  let index = 0;

  while (index < valuesSql.length) {
    while (index < valuesSql.length && /[\s,]/.test(valuesSql[index])) {
      index += 1;
    }

    if (index >= valuesSql.length) {
      break;
    }

    if (valuesSql[index] !== "(") {
      throw new Error(`Expected '(' at ${index}`);
    }

    index += 1;
    const values = [];

    while (index < valuesSql.length) {
      while (index < valuesSql.length && /\s/.test(valuesSql[index])) {
        index += 1;
      }

      const parsed = parseSqlValue(valuesSql, index);
      values.push(parsed.value);
      index = parsed.nextIndex;

      while (index < valuesSql.length && /\s/.test(valuesSql[index])) {
        index += 1;
      }

      if (valuesSql[index] === ",") {
        index += 1;
        continue;
      }

      if (valuesSql[index] === ")") {
        index += 1;
        rows.push(values);
        break;
      }

      throw new Error(`Unexpected character '${valuesSql[index]}' at ${index}`);
    }
  }

  return rows;
}

function parseSqlValue(source, start) {
  if (source.startsWith("NULL", start)) {
    return { value: null, nextIndex: start + 4 };
  }

  if (source[start] === "'") {
    let index = start + 1;
    let value = "";

    while (index < source.length) {
      const char = source[index];

      if (char === "\\" && source[index + 1]) {
        value += source[index + 1];
        index += 2;
        continue;
      }

      if (char === "'" && source[index + 1] === "'") {
        value += "'";
        index += 2;
        continue;
      }

      if (char === "'") {
        return { value, nextIndex: index + 1 };
      }

      value += char;
      index += 1;
    }

    throw new Error("Unterminated SQL string");
  }

  let index = start;

  while (index < source.length && /[0-9.-]/.test(source[index])) {
    index += 1;
  }

  return { value: Number(source.slice(start, index)), nextIndex: index };
}

function renderSeedData({
  appConfigRows,
  displayGroupRows,
  productRules,
  questRules,
  thresholdRows,
  conditionRows,
  productRuleIds,
  rulesById,
}) {
  const groupOrder = [
    "full-frame-camera",
    "prime-lens",
    "wide-normal-zoom-lens",
    "telephoto-super-telephoto-lens",
    "macro-lens",
    "quest",
  ];
  const groups = [...displayGroupRows].sort(
    (left, right) => groupOrder.indexOf(left.group_code) - groupOrder.indexOf(right.group_code),
  );
  const modelsByGroup = {};

  for (const rule of productRules) {
    const groupCode = rule.display_group_code;
    modelsByGroup[groupCode] ??= [];
    modelsByGroup[groupCode].push(rule);
  }

  const campaignName = appConfigRows.find((row) => row.key === "campaign_name")?.value;
  const badgeRulesVersion = appConfigRows.find((row) => row.key === "badge_rules_version")?.value;
  const supportMessage = appConfigRows.find((row) => row.key === "support_message")?.value;

  return `// GENERATED FROM scripts/db/uat_sony_table.sql
// Regenerated: node scripts/prod/generate-seed-data.mjs
// SEL1224GM condition is attached to product-sel1224gm (UAT dump had it on ILCE-7SM3).
// SELP18110G share URL is de-duplicated from the UAT dump.

export const appConfig = [
  ["campaign_name", ${jsString(campaignName)}],
  ["badge_rules_version", ${jsString(badgeRulesVersion)}],
  ["support_message", ${jsString(supportMessage)}],
];

export const badgeDisplayGroups = [
${groups
  .map(
    (group) =>
      `  [${jsString(group.group_code)}, ${jsString(group.badge_type)}, ${jsString(group.display_name)}, ${group.sort_order}],`,
  )
  .join("\n")}
].map(([code, badgeType, displayName, sortOrder]) => ({
  code,
  badgeType,
  displayName,
  sortOrder,
}));

const productModelsByGroup = {
${Object.entries(modelsByGroup)
  .map(([groupCode, rules]) => {
    const rows = rules
      .map(
        (rule) =>
          `    [${jsString(rule.product_model_code)}, ${jsString(rule.badge_name)}],`,
      )
      .join("\n");
    return `  ${jsString(groupCode)}: [\n${rows}\n  ],`;
  })
  .join("\n")}
};

const productUrlsByModelCode = {
${productRules
  .map((rule) => `  ${jsKey(rule.product_model_code)}: ${jsString(rule.product_url)},`)
  .join("\n")}
};

const productImageUrlsByModelCode = {
${productRules
  .map((rule) => {
    const threshold = thresholdRows.find((row) => row.badge_rule_id === rule.id);
    return `  ${jsKey(rule.product_model_code)}: ${jsString(cleanUrl(threshold?.achieved_image_url))},`;
  })
  .join("\n")}
};

const productRuleByModel = new Map([
${productRules
  .map(
    (rule) =>
      `  [${jsString(rule.product_model_code)}, { code: ${jsString(rule.badge_code)}, description: ${jsString(rule.description)}, sortOrder: ${rule.sort_order} }],`,
  )
  .join("\n")}
]);

const productBadgeRules = Object.entries(productModelsByGroup).flatMap(
  ([displayGroupCode, models]) =>
    models.map(([modelCode, displayName]) => {
      const source = productRuleByModel.get(modelCode);
      const imageUrl = productImageUrlsByModelCode[modelCode] ?? null;

      return {
        code: source.code,
        name: displayName,
        badgeType: "product",
        ruleType: "achievement",
        displayCategory: "Product Badge",
        displayGroup: displayGroupCode,
        displayGroupCode,
        productModelCode: modelCode,
        productUrl: productUrlsByModelCode[modelCode] ?? null,
        imageUrl,
        description: source.description,
        sortOrder: source.sortOrder,
        activeFrom: null,
        activeTo: null,
        registrationStart: null,
        registrationEnd: null,
      };
    }),
);

const questBadgeRules = [
${questRules
  .map(
    (rule) =>
      `  [${jsString(rule.badge_code)}, ${jsString(rule.badge_name)}, ${jsString(rule.rule_type)}, ${rule.sort_order}, ${jsString(rule.description)}],`,
  )
  .join("\n")}
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
${thresholdRows
  .filter((row) => !productRuleIds.has(row.badge_rule_id))
  .map((row) => {
    const rule = rulesById.get(row.badge_rule_id);
    const imageUrl = cleanUrl(row.achieved_image_url);
    return `  [${jsString(rule.badge_code)}, ${jsString(row.level)}, ${jsString(row.display_name)}, ${row.required_count}, ${row.sort_order}, ${jsString(imageUrl)}],`;
  })
  .join("\n")}
].map(([ruleCode, level, displayName, requiredCount, sortOrder, imageUrl]) => ({
  ruleCode,
  level,
  displayName,
  requiredCount,
  achievedImageUrl: imageUrl,
  lockedImageUrl: null,
  shareImageUrl: imageUrl,
  sortOrder,
}));

export const badgeThresholds = [...productThresholds, ...questThresholds];

const productConditions = productBadgeRules.map((rule) => ({
  ruleCode: rule.code,
  label: \`Own \${rule.productModelCode}\`,
  matchType: "any",
  requiredCount: 1,
  sonySkus: [rule.productModelCode],
}));

const questConditions = [
${conditionRows
  .filter((row) => !productRuleIds.has(row.badge_rule_id))
  .map((row) => {
    const rule = rulesById.get(row.badge_rule_id);
    const skus = JSON.parse(row.sony_skus);
    return `  [${jsString(rule.badge_code)}, ${jsString(row.condition_label)}, ${jsString(row.match_type)}, ${row.required_count}, ${JSON.stringify(skus)}],`;
  })
  .join("\n")}
].map(([ruleCode, label, matchType, requiredCount, sonySkus]) => ({
  ruleCode,
  label,
  matchType,
  requiredCount,
  sonySkus,
}));

export const badgeConditions = [...productConditions, ...questConditions];
`;
}

function cleanUrl(value) {
  if (!value) {
    return null;
  }

  const duplicated = value.match(/^(https?:\/\/.+?\.png)https?:\/\//);
  return duplicated ? duplicated[1] : value;
}

function jsString(value) {
  if (value === null || value === undefined) {
    return "null";
  }

  return JSON.stringify(value);
}

function jsKey(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : JSON.stringify(value);
}
