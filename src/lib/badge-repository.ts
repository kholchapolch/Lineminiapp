import "server-only";

import { mapBadgeRows, demoBadgeDisplay } from "@/lib/badge-display";
import { getPool } from "@/lib/db";
import type { BadgeDisplayRow, CustomerBadgeDisplay } from "@/types/badge";

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
