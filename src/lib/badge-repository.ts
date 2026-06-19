import "server-only";

import { getPool } from "@/lib/db";
import { hashLineUuid } from "@/lib/safe-logging";
import { getReadableSkuLabel } from "@/lib/sku-labels";
import type {
  BadgeRuleConfig,
  BadgeThresholdConfig,
  DbDebugTable,
  DbDebugValue,
  DbSchemaColumn,
} from "@/types/badge";

const FALLBACK_SUPPORT_MESSAGE =
  "Please contact Sony Thailand support if badge data looks incorrect.";
const FALLBACK_BADGE_RULES_VERSION = "local-fallback";
const CONFIG_CACHE_TTL_MS = 60_000;

let badgeRuntimeConfigCache:
  | { databaseUrl: string | undefined; expiresAt: number; value: BadgeRuntimeConfig }
  | null = null;
let activeBadgeRulesCache:
  | { expiresAt: number; version: string; rules: BadgeRuleConfig[] }
  | null = null;

export type BadgeRuntimeConfig = {
  supportMessage: string;
  badgeRulesVersion: string;
};

const fallbackBadgeRules: BadgeRuleConfig[] = [
  createFallbackRule({
    id: 1,
    code: "ff-camera-owner",
    name: "Key FF Models",
    badgeType: "product",
    displayCategory: "Product ownership badge",
    displayGroup: "Key FF models",
    description: "Own one supported Sony full-frame camera body.",
    sortOrder: 10,
    requiredCount: 1,
    imageText: "FF",
    groups: [
      {
        label: "Own any key FF model",
        matchType: "any",
        requiredCount: 1,
        skus: ["ILCE-1M2", "ILCE-9M3", "ILCE-7RM5", "ILCE-7M5", "ILCE-7CM2", "OTHER_FF"],
      },
    ],
  }),
  createFallbackRule({
    id: 2,
    code: "key-lens-owner",
    name: "Key Lens Models",
    badgeType: "product",
    displayCategory: "Product ownership badge",
    displayGroup: "Key Lens models",
    description: "Own one supported Sony GM lens.",
    sortOrder: 20,
    requiredCount: 1,
    imageText: "Lens",
    groups: [
      {
        label: "Own any key lens model",
        matchType: "any",
        requiredCount: 1,
        skus: ["SEL2470GM2", "SEL1635GM2", "SEL70200GM2", "SEL50F12GM", "SEL50F14GM", "SEL35F14GM", "SEL50150F2GM", "SEL2870F2GM", "OTHER_GM_LENS"],
      },
    ],
  }),
  createFallbackRule({ id: 3, code: "portrait-master", name: "Portrait Master", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By COI", description: "Own portrait GM lens coverage across 50mm, 85mm, and 135mm.", sortOrder: 30, requiredCount: 3, imageText: "Portrait", groups: [{ label: "Own portrait GM set", matchType: "all", requiredCount: 3, skus: ["SEL50F14GM", "SEL85F14GM2", "SEL135F18GM"] }] }),
  createFallbackRule({ id: 4, code: "travel-master", name: "Travel Master", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By COI", description: "Own one wide travel lens and the required travel GM/G lens set.", sortOrder: 40, requiredCount: 5, imageText: "Travel", groups: [{ label: "Own one wide travel lens", matchType: "any", requiredCount: 1, skus: ["SEL14F18GM", "SEL16F18G", "SEL20F18G"] }, { label: "Own required travel lens set", matchType: "all", requiredCount: 4, skus: ["SEL1635GM2", "SEL2470GM2", "SEL2450G", "SEL20F18G"] }] }),
  createFallbackRule({ id: 5, code: "bird-wildlife-master", name: "Bird & Wildlife Master", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By COI", description: "Own two supported wildlife lenses.", sortOrder: 50, requiredCount: 2, imageText: "Wildlife", groups: [{ label: "Own any two wildlife lenses", matchType: "min_count", requiredCount: 2, skus: ["SEL400800G", "SEL200600G", "SEL300F28GM", "SEL400F28GM", "SEL600F28GM"] }] }),
  createFallbackRule({ id: 6, code: "trinity-master-gm", name: "Trinity Master GM", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By customer pride", description: "Own the GM trinity lens set.", sortOrder: 60, requiredCount: 3, imageText: "GM", groups: [{ label: "Own GM trinity set", matchType: "all", requiredCount: 3, skus: ["SEL2470GM2", "SEL1635GM2", "SEL70200GM2"] }] }),
  createFallbackRule({ id: 7, code: "trinity-master-g", name: "Trinity Master G", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By customer pride", description: "Own the G trinity lens set.", sortOrder: 70, requiredCount: 3, imageText: "G", groups: [{ label: "Own G trinity set", matchType: "all", requiredCount: 3, skus: ["SEL2450G", "SEL1625G", "SEL70200G2"] }] }),
  createFallbackRule({ id: 8, code: "premium-master", name: "Premium Master", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By customer pride", description: "Own two supported F2 premium lenses.", sortOrder: 80, requiredCount: 2, imageText: "Premium", groups: [{ label: "Own two F2 lenses", matchType: "min_count", requiredCount: 2, skus: ["SEL50150F2GM", "SEL2870F2GM"] }] }),
  createFallbackRule({ id: 9, code: "first-macro-lens", name: "First Macro Lens", badgeType: "quest", displayCategory: "Achievement badge", displayGroup: "By customer pride", description: "Own one supported macro lens.", sortOrder: 90, requiredCount: 1, imageText: "Macro", groups: [{ label: "Own one macro lens", matchType: "any", requiredCount: 1, skus: ["SEL90M28G", "SEL50M28"] }] }),
];

type FallbackRuleInput = {
  id: number;
  code: string;
  name: string;
  badgeType: "product" | "quest";
  displayCategory: string;
  displayGroup: string | null;
  description: string;
  sortOrder: number;
  requiredCount: number;
  imageText: string;
  groups: Array<{
    label: string;
    matchType: "any" | "all" | "min_count";
    requiredCount: number;
    skus: string[];
  }>;
};

function createFallbackRule(input: FallbackRuleInput): BadgeRuleConfig {
  const skus = Array.from(new Set(input.groups.flatMap((group) => group.skus)));

  return {
    id: input.id,
    code: input.code,
    name: input.name,
    ruleType: "achievement",
    badgeType: input.badgeType,
    displayCategory: input.displayCategory,
    displayGroup: input.displayGroup,
    description: input.description,
    sortOrder: input.sortOrder,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus,
    thresholds: [
      {
        level: "achievement",
        displayName: input.name,
        requiredCount: input.requiredCount,
        achievedImageUrl: `https://placehold.co/240x240?text=${encodeURIComponent(input.imageText)}`,
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
        sortOrder: input.sortOrder,
      },
    ],
    conditions: input.groups.map((group, groupIndex) => ({
      id: input.id * 100 + groupIndex + 1,
      label: group.label,
      matchType: group.matchType,
      requiredCount: group.requiredCount,
      sonySkus: group.skus,
    })),
  };
}

type RuleRow = {
  badge_rule_id: number;
  badge_code: string;
  badge_name: string;
  badge_type: "product" | "quest";
  rule_type: "tier" | "achievement";
  display_category: string;
  display_group: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  active_from: string | Date | null;
  active_to: string | Date | null;
  registration_start: string | Date | null;
  registration_end: string | Date | null;
  threshold_level: string | null;
  threshold_display_name: string | null;
  threshold_required_count: number | null;
  threshold_achieved_image_url: string | null;
  threshold_locked_image_url: string | null;
  threshold_sort_order: number | null;
  condition_id: number | null;
  condition_label: string | null;
  condition_match_type: "any" | "all" | "min_count" | null;
  condition_required_count: number | null;
  condition_skus: string[] | null;
};

type DbSchemaColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
  ordinal_position: number;
};

export async function getSupportMessage(): Promise<string> {
  return (await getBadgeRuntimeConfig()).supportMessage;
}

export async function getBadgeRuntimeConfig(): Promise<BadgeRuntimeConfig> {
  const now = Date.now();
  const databaseUrl = process.env.DATABASE_URL;

  if (
    badgeRuntimeConfigCache &&
    badgeRuntimeConfigCache.databaseUrl === databaseUrl &&
    badgeRuntimeConfigCache.expiresAt > now
  ) {
    return badgeRuntimeConfigCache.value;
  }

  if (!databaseUrl) {
    const value = {
      supportMessage: FALLBACK_SUPPORT_MESSAGE,
      badgeRulesVersion: FALLBACK_BADGE_RULES_VERSION,
    };
    badgeRuntimeConfigCache = { databaseUrl, expiresAt: now + CONFIG_CACHE_TTL_MS, value };
    return value;
  }

  const pool = getPool();
  const result = await pool.query<{ key: string; value: string }>(
    "SELECT key, value FROM app_config WHERE key IN ('support_message', 'badge_rules_version')",
  );
  const values = new Map(result.rows.map((row) => [row.key, row.value]));
  const value = {
    supportMessage: values.get("support_message") ?? FALLBACK_SUPPORT_MESSAGE,
    badgeRulesVersion: values.get("badge_rules_version") ?? FALLBACK_BADGE_RULES_VERSION,
  };

  badgeRuntimeConfigCache = { databaseUrl, expiresAt: now + CONFIG_CACHE_TTL_MS, value };
  return value;
}

export async function getActiveBadgeRules(options: {
  version?: string;
  bypassCache?: boolean;
} = {}): Promise<BadgeRuleConfig[]> {
  const now = Date.now();
  const version = options.version;

  if (
    version &&
    !options.bypassCache &&
    activeBadgeRulesCache &&
    activeBadgeRulesCache.version === version &&
    activeBadgeRulesCache.expiresAt > now
  ) {
    return activeBadgeRulesCache.rules;
  }

  if (!process.env.DATABASE_URL) {
    return fallbackBadgeRules;
  }

  const pool = getPool();
  const result = await pool.query<RuleRow>(
    `
      SELECT
        br.id AS badge_rule_id,
        br.badge_code,
        br.badge_name,
        br.badge_type,
        br.rule_type,
        br.display_category,
        br.display_group,
        br.description,
        br.sort_order,
        br.is_active,
        br.active_from,
        br.active_to,
        br.registration_start,
        br.registration_end,
        brt.level AS threshold_level,
        brt.display_name AS threshold_display_name,
        brt.required_count AS threshold_required_count,
        brt.achieved_image_url AS threshold_achieved_image_url,
        brt.locked_image_url AS threshold_locked_image_url,
        brt.sort_order AS threshold_sort_order,
        brc.id AS condition_id,
        brc.condition_label AS condition_label,
        brc.match_type AS condition_match_type,
        brc.required_count AS condition_required_count,
        brc.sony_skus AS condition_skus
      FROM badge_rules br
      LEFT JOIN badge_rule_thresholds brt
        ON brt.badge_rule_id = br.id
      LEFT JOIN badge_rule_conditions brc
        ON brc.badge_rule_id = br.id
      WHERE br.is_active = true
      ORDER BY br.sort_order ASC, br.badge_name ASC, br.badge_code ASC, brt.sort_order ASC, brc.id ASC
    `,
  );

  const rules = mapRuleRows(result.rows);

  if (version && !options.bypassCache) {
    activeBadgeRulesCache = {
      expiresAt: now + CONFIG_CACHE_TTL_MS,
      version,
      rules,
    };
  }

  return rules;
}

export async function getPublicDbSchema(): Promise<DbSchemaColumn[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const pool = getPool();
  const result = await pool.query<DbSchemaColumnRow>(
    `
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name ASC, ordinal_position ASC
    `,
  );

  return result.rows.map((row) => ({
    tableName: row.table_name,
    columnName: row.column_name,
    dataType: row.data_type,
    isNullable: row.is_nullable === "YES",
    columnDefault: row.column_default,
    ordinalPosition: row.ordinal_position,
  }));
}

export async function getDebugDbTables(): Promise<DbDebugTable[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const pool = getPool();
  const [
    appConfig,
    badgeRules,
    badgeRuleThresholds,
    badgeRuleConditions,
    badgeCalculationLogs,
  ] = await Promise.all([
    pool.query("SELECT key, value FROM app_config ORDER BY key ASC"),
    pool.query(`
      SELECT
        id,
        badge_code,
        badge_name,
        badge_type,
        rule_type,
        display_category,
        display_group,
        description,
        sort_order,
        is_active,
        active_from,
        active_to,
        registration_start,
        registration_end
      FROM badge_rules
      ORDER BY sort_order ASC, id ASC
    `),
    pool.query(`
      SELECT
        id,
        badge_rule_id,
        level,
        display_name,
        required_count,
        achieved_image_url,
        locked_image_url,
        sort_order
      FROM badge_rule_thresholds
      ORDER BY badge_rule_id ASC, sort_order ASC, id ASC
    `),
    pool.query(`
      SELECT
        id,
        badge_rule_id,
        condition_label,
        match_type,
        required_count,
        sony_skus
      FROM badge_rule_conditions
      ORDER BY badge_rule_id ASC, id ASC
    `),
    pool.query(`
      SELECT
        id,
        customer_line_uuid_hash,
        source_sku_count,
        matched_sku_count,
        earned_badges_json,
        error_code,
        error_message,
        created_at
      FROM badge_calculation_logs
      ORDER BY created_at DESC
      LIMIT 10
    `),
  ]);

  return [
    { tableName: "app_config", rows: appConfig.rows.map(toDebugRow) },
    { tableName: "badge_rules", rows: badgeRules.rows.map(toDebugRow) },
    { tableName: "badge_rule_thresholds", rows: badgeRuleThresholds.rows.map(toDebugRow) },
    {
      tableName: "badge_rule_conditions",
      rows: badgeRuleConditions.rows.map((row) =>
        toDebugRow({
          ...row,
          sony_sku_label_map: Array.isArray(row.sony_skus)
            ? Object.fromEntries(
                row.sony_skus.map((sku: unknown) => [
                  String(sku),
                  getReadableSkuLabel(String(sku)),
                ]),
              )
            : {},
        }),
      ),
    },
    { tableName: "badge_calculation_logs_recent", rows: badgeCalculationLogs.rows.map(toDebugRow) },
  ];
}

function toDebugRow(row: Record<string, unknown>): Record<string, DbDebugValue> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, toDebugValue(value)]),
  );
}

function toDebugValue(value: unknown): DbDebugValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toDebugValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        toDebugValue(entry),
      ]),
    );
  }

  return String(value);
}

function mapRuleRows(rows: RuleRow[]): BadgeRuleConfig[] {
  const rules = new Map<number, BadgeRuleConfig>();

  for (const row of rows) {
    let rule = rules.get(row.badge_rule_id);

    if (!rule) {
      rule = {
        id: row.badge_rule_id,
        code: row.badge_code,
        name: row.badge_name,
        badgeType: row.badge_type,
        ruleType: row.rule_type,
        displayCategory: row.display_category,
        displayGroup: row.display_group,
        description: row.description,
        sortOrder: row.sort_order,
        isActive: row.is_active,
        activeFrom: formatDate(row.active_from),
        activeTo: formatDate(row.active_to),
        registrationStart: formatDate(row.registration_start),
        registrationEnd: formatDate(row.registration_end),
        skus: [],
        thresholds: [],
        conditions: [],
      };
      rules.set(row.badge_rule_id, rule);
    }

    if (
      row.threshold_level &&
      row.threshold_display_name &&
      row.threshold_required_count !== null &&
      !rule.thresholds.some((threshold) => threshold.level === row.threshold_level)
    ) {
      rule.thresholds.push({
        level: row.threshold_level,
        displayName: row.threshold_display_name,
        requiredCount: row.threshold_required_count,
        achievedImageUrl: row.threshold_achieved_image_url,
        lockedImageUrl: row.threshold_locked_image_url,
        sortOrder: row.threshold_sort_order ?? 0,
      });
    }

    if (
      row.condition_id &&
      row.condition_label &&
      row.condition_match_type &&
      row.condition_required_count !== null
    ) {
      const conditions = rule.conditions ?? [];
      const sonySkus = Array.isArray(row.condition_skus)
        ? row.condition_skus.filter((sku): sku is string => typeof sku === "string")
        : [];
      const conditionExists = conditions.some(
        (condition) => condition.id === row.condition_id,
      );

      if (!conditionExists) {
        conditions.push({
          id: row.condition_id,
          label: row.condition_label,
          matchType: row.condition_match_type,
          requiredCount: row.condition_required_count,
          sonySkus,
        });
        rule.conditions = conditions;
      }
    }
  }

  return Array.from(rules.values()).map((rule) => ({
    ...rule,
    skus: deriveSkus(rule).sort((left, right) => left.localeCompare(right)),
    thresholds: [...rule.thresholds].sort(
      (left, right) =>
        (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
        left.requiredCount - right.requiredCount,
    ),
    conditions: [...(rule.conditions ?? [])]
      .sort((left, right) => left.id - right.id || left.label.localeCompare(right.label))
      .map((condition) => ({
        ...condition,
        sonySkus: [...condition.sonySkus].sort((left, right) => left.localeCompare(right)),
      })),
  }));
}

function formatDate(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function deriveSkus(rule: BadgeRuleConfig): string[] {
  const conditionSkus = (rule.conditions ?? []).flatMap((condition) => condition.sonySkus);

  return Array.from(new Set(conditionSkus.length > 0 ? conditionSkus : rule.skus));
}

type BadgeCalculationLogInput = {
  lineuuid: string;
  sourceProductCount: number;
  matchedSkuCount: number;
  resultSummary: unknown;
  errorCode?: string;
  errorMessage?: string;
};

export async function writeBadgeCalculationLog(input: BadgeCalculationLogInput): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const pool = getPool();
  await pool.query(
    `
      INSERT INTO badge_calculation_logs (
        customer_line_uuid_hash,
        source_sku_count,
        matched_sku_count,
        earned_badges_json,
        error_code,
        error_message
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      hashLineUuid(input.lineuuid),
      input.sourceProductCount,
      input.matchedSkuCount,
      JSON.stringify(input.resultSummary),
      input.errorCode ?? null,
      input.errorMessage ?? null,
    ],
  );
}
