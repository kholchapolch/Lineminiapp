BEGIN;

TRUNCATE badge_calculation_logs, customer_badges, badge_rule_skus, badge_rule_thresholds, badge_rules, customers, app_config
RESTART IDENTITY CASCADE;

INSERT INTO app_config (key, value) VALUES
  ('campaign_name', 'Sony Badge Pilot'),
  ('support_message', 'Please contact Sony Thailand support if badge data looks incorrect.');

INSERT INTO customers (id, display_name, line_display_name, line_picture_url) VALUES
  ('demo-earned', 'Nicha Wong', 'Nicha', NULL),
  ('demo-locked', 'Krit Tan', 'Krit', NULL),
  ('demo-empty', 'Mali Chai', 'Mali', NULL),
  ('demo-missing-data', 'Anon Sony', 'Anon', NULL);

INSERT INTO badge_rules (
  badge_code,
  badge_name,
  badge_type,
  rule_type,
  description,
  image_url,
  locked_image_url,
  required_count,
  sort_order,
  active_from,
  active_to,
  registration_start,
  registration_end
) VALUES
  (
    'alpha-tier',
    'Alpha Collector',
    'product',
    'tier',
    'Collect eligible Sony Alpha camera and G Master lens products.',
    'https://placehold.co/240x240?text=Alpha+Gold',
    'https://placehold.co/240x240?text=Locked',
    3,
    10,
    DATE '2026-05-01',
    DATE '2026-12-31',
    DATE '2026-05-01',
    DATE '2026-12-31'
  ),
  (
    'pro-achievement',
    'Pro Achievement',
    'quest',
    'achievement',
    'Own three eligible Sony products during the campaign.',
    'https://placehold.co/240x240?text=Achievement',
    'https://placehold.co/240x240?text=Locked',
    3,
    20,
    DATE '2026-05-01',
    DATE '2026-12-31',
    DATE '2026-05-01',
    DATE '2026-12-31'
  );

INSERT INTO badge_rule_thresholds (
  badge_rule_id,
  level,
  display_name,
  required_count,
  image_url,
  locked_image_url,
  sort_order
)
SELECT br.id, threshold.level, threshold.display_name, threshold.required_count, threshold.image_url, threshold.locked_image_url, threshold.sort_order
FROM badge_rules br
CROSS JOIN LATERAL (
  VALUES
    ('bronze', 'Bronze', 1, 'https://placehold.co/240x240?text=Alpha+Bronze', 'https://placehold.co/240x240?text=Locked', 10),
    ('silver', 'Silver', 2, 'https://placehold.co/240x240?text=Alpha+Silver', 'https://placehold.co/240x240?text=Locked', 20),
    ('gold', 'Gold', 3, 'https://placehold.co/240x240?text=Alpha+Gold', 'https://placehold.co/240x240?text=Locked', 30)
) AS threshold(level, display_name, required_count, image_url, locked_image_url, sort_order)
WHERE br.badge_code = 'alpha-tier';

INSERT INTO badge_rule_thresholds (
  badge_rule_id,
  level,
  display_name,
  required_count,
  image_url,
  locked_image_url,
  sort_order
)
SELECT br.id, 'achievement', 'Achievement', 3, 'https://placehold.co/240x240?text=Achievement', 'https://placehold.co/240x240?text=Locked', 10
FROM badge_rules br
WHERE br.badge_code = 'pro-achievement';

INSERT INTO badge_rule_skus (badge_rule_id, sony_sku)
SELECT id, sku
FROM badge_rules
CROSS JOIN LATERAL (
  VALUES
    ('ILCE-7M4'),
    ('SEL35F14GM'),
    ('SEL2470GM2')
) AS sku_list(sku)
WHERE badge_code IN ('alpha-tier', 'pro-achievement');

INSERT INTO customer_badges (
  customer_id,
  badge_rule_id,
  matched_count,
  serial_number,
  model_name,
  registration_date,
  issued_at
)
SELECT 'demo-earned', id, required_count, 'SN-A7M4-001', 'Alpha 7 IV', DATE '2026-05-20', now()
FROM badge_rules
WHERE badge_code = 'alpha-tier';

INSERT INTO customer_badges (
  customer_id,
  badge_rule_id,
  matched_count,
  serial_number,
  model_name,
  registration_date,
  issued_at
)
SELECT 'demo-locked', id, 1, 'SN-LENS-001', 'FE 35mm F1.4 GM', DATE '2026-05-21', NULL
FROM badge_rules
WHERE badge_code = 'pro-achievement';

INSERT INTO customer_badges (
  customer_id,
  badge_rule_id,
  matched_count,
  serial_number,
  model_name,
  registration_date,
  issued_at
)
SELECT 'demo-missing-data', id, 1, NULL, NULL, NULL, now()
FROM badge_rules
WHERE badge_code = 'alpha-tier';

COMMIT;
