import "server-only";

import { mapBadgeRows, demoBadgeDisplay } from "@/lib/badge-display";
import { getPool } from "@/lib/db";
import { hashLineUuid } from "@/lib/safe-logging";
import type { BadgeDisplayRow, BadgeRuleConfig, BadgeThresholdConfig, CustomerBadgeDisplay } from "@/types/badge";

export async function getCustomerBadgeDisplay(
  customerId: string,
): Promise<CustomerBadgeDisplay | null> {
  if (!process.env.DATABASE_URL) {
    return demoBadgeDisplay;
  }

  const pool = getPool();
  const result = await pool.query<BadgeDisplayRow>(
    `
      SELECT
        c.id AS customer_id,
        c.display_name,
        c.line_display_name,
        c.line_picture_url,
        support.value AS support_message,
        br.badge_code,
        br.badge_name,
        br.badge_type,
        br.description,
        br.image_url,
        br.locked_image_url,
        br.required_count,
        cb.matched_count,
        cb.serial_number,
        cb.model_name,
        cb.registration_date
      FROM customers c
      CROSS JOIN badge_rules br
      LEFT JOIN customer_badges cb
        ON cb.customer_id = c.id
       AND cb.badge_rule_id = br.id
      LEFT JOIN app_config support
        ON support.key = 'support_message'
      WHERE c.id = $1
        AND br.is_active = true
      ORDER BY br.sort_order ASC, br.badge_name ASC
    `,
    [customerId],
  );

  return mapBadgeRows(result.rows);
}


const FALLBACK_SUPPORT_MESSAGE =
  "Please contact Sony Thailand support if badge data looks incorrect.";

const fallbackBadgeRules: BadgeRuleConfig[] = [
  {
    id: 1,
    code: "alpha-tier",
    name: "Alpha Collector",
    ruleType: "tier",
    description: "Collect eligible Sony Alpha camera and G Master lens products.",
    sortOrder: 10,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
    thresholds: [
      {
        level: "bronze",
        displayName: "Bronze",
        requiredCount: 1,
        imageUrl: "https://placehold.co/240x240?text=Alpha+Bronze",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
      {
        level: "silver",
        displayName: "Silver",
        requiredCount: 2,
        imageUrl: "https://placehold.co/240x240?text=Alpha+Silver",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
      {
        level: "gold",
        displayName: "Gold",
        requiredCount: 3,
        imageUrl: "https://placehold.co/240x240?text=Alpha+Gold",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },
  {
    id: 2,
    code: "pro-achievement",
    name: "Pro Achievement",
    ruleType: "achievement",
    description: "Own three eligible Sony products during the campaign.",
    sortOrder: 20,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["ILCE-7M4", "SEL35F14GM", "SEL2470GM2"],
    thresholds: [
      {
        level: "achievement",
        displayName: "Achievement",
        requiredCount: 3,
        imageUrl: "https://placehold.co/240x240?text=Achievement",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },

  {
    id: 3,
    code: "camera-starter",
    name: "Camera Starter",
    ruleType: "achievement",
    description: "Future badge for first camera registration.",
    sortOrder: 30,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["FUTURE-CAMERA"],
    thresholds: [
      {
        level: "achievement",
        displayName: "Starter",
        requiredCount: 1,
        imageUrl: "https://placehold.co/240x240?text=Starter",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },
  {
    id: 4,
    code: "lens-lover",
    name: "Lens Lover",
    ruleType: "achievement",
    description: "Future badge for lens collection behavior.",
    sortOrder: 40,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["FUTURE-LENS"],
    thresholds: [
      {
        level: "achievement",
        displayName: "Lens",
        requiredCount: 1,
        imageUrl: "https://placehold.co/240x240?text=Lens",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },
  {
    id: 5,
    code: "audio-fan",
    name: "Audio Fan",
    ruleType: "achievement",
    description: "Future badge for eligible Sony audio products.",
    sortOrder: 50,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["FUTURE-AUDIO"],
    thresholds: [
      {
        level: "achievement",
        displayName: "Audio",
        requiredCount: 1,
        imageUrl: "https://placehold.co/240x240?text=Audio",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },
  {
    id: 6,
    code: "creator-pass",
    name: "Creator Pass",
    ruleType: "achievement",
    description: "Future badge for creator campaign participation.",
    sortOrder: 60,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["FUTURE-CREATOR"],
    thresholds: [
      {
        level: "achievement",
        displayName: "Creator",
        requiredCount: 1,
        imageUrl: "https://placehold.co/240x240?text=Creator",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },
  {
    id: 7,
    code: "event-pass",
    name: "Event Pass",
    ruleType: "achievement",
    description: "Future badge for Sony event attendance.",
    sortOrder: 70,
    isActive: true,
    activeFrom: "2026-05-01",
    activeTo: "2026-12-31",
    registrationStart: "2026-05-01",
    registrationEnd: "2026-12-31",
    skus: ["FUTURE-EVENT"],
    thresholds: [
      {
        level: "achievement",
        displayName: "Event",
        requiredCount: 1,
        imageUrl: "https://placehold.co/240x240?text=Event",
        lockedImageUrl: "https://placehold.co/240x240?text=Locked",
      },
    ],
  },
];

type RuleRow = {
  badge_rule_id: number;
  badge_code: string;
  badge_name: string;
  rule_type: "tier" | "achievement";
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
  threshold_image_url: string | null;
  threshold_locked_image_url: string | null;
  sony_sku: string | null;
};

export async function getSupportMessage(): Promise<string> {
  if (!process.env.DATABASE_URL) {
    return FALLBACK_SUPPORT_MESSAGE;
  }

  const pool = getPool();
  const result = await pool.query<{ value: string }>(
    "SELECT value FROM app_config WHERE key = 'support_message' LIMIT 1",
  );

  return result.rows[0]?.value ?? FALLBACK_SUPPORT_MESSAGE;
}

export async function getActiveBadgeRules(): Promise<BadgeRuleConfig[]> {
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
        br.rule_type,
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
        brt.image_url AS threshold_image_url,
        brt.locked_image_url AS threshold_locked_image_url,
        brs.sony_sku
      FROM badge_rules br
      LEFT JOIN badge_rule_thresholds brt
        ON brt.badge_rule_id = br.id
      LEFT JOIN badge_rule_skus brs
        ON brs.badge_rule_id = br.id
       AND brs.is_active = true
      WHERE br.is_active = true
      ORDER BY br.sort_order ASC, br.badge_name ASC, brt.sort_order ASC
    `,
  );

  return mapRuleRows(result.rows);
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
        ruleType: row.rule_type,
        description: row.description,
        sortOrder: row.sort_order,
        isActive: row.is_active,
        activeFrom: formatDate(row.active_from),
        activeTo: formatDate(row.active_to),
        registrationStart: formatDate(row.registration_start),
        registrationEnd: formatDate(row.registration_end),
        skus: [],
        thresholds: [],
      };
      rules.set(row.badge_rule_id, rule);
    }

    if (row.sony_sku && !rule.skus.includes(row.sony_sku)) {
      rule.skus.push(row.sony_sku);
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
        imageUrl: row.threshold_image_url,
        lockedImageUrl: row.threshold_locked_image_url,
      });
    }
  }

  return Array.from(rules.values());
}

function formatDate(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
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
