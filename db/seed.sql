BEGIN;

TRUNCATE customer_badges, badge_rule_skus, badge_rules, customers, app_config
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
  description,
  image_url,
  locked_image_url,
  required_count,
  sort_order
) VALUES
  (
    'alpha-owner',
    'Alpha Owner',
    'product',
    'Own a supported Sony Alpha camera.',
    'https://placehold.co/240x240?text=Alpha',
    'https://placehold.co/240x240?text=Locked',
    1,
    10
  ),
  (
    'lens-collector',
    'Lens Collector',
    'quest',
    'Register three eligible Sony lens products.',
    'https://placehold.co/240x240?text=Lens',
    'https://placehold.co/240x240?text=Locked',
    3,
    20
  );

INSERT INTO badge_rule_skus (badge_rule_id, sony_sku)
SELECT id, sku
FROM badge_rules
CROSS JOIN LATERAL (
  VALUES
    ('ILCE-7M4'),
    ('SEL35F14GM'),
    ('SEL2470GM2')
) AS sku_list(sku)
WHERE badge_code IN ('alpha-owner', 'lens-collector');

INSERT INTO customer_badges (
  customer_id,
  badge_rule_id,
  matched_count,
  serial_number,
  model_name,
  registration_date,
  issued_at
)
SELECT 'demo-earned', id, required_count, 'SN-A7M4-001', 'ILCE-7M4', DATE '2026-05-20', now()
FROM badge_rules
WHERE badge_code = 'alpha-owner';

INSERT INTO customer_badges (
  customer_id,
  badge_rule_id,
  matched_count,
  serial_number,
  model_name,
  registration_date,
  issued_at
)
SELECT 'demo-locked', id, 1, 'SN-LENS-001', 'SEL35F14GM', DATE '2026-05-21', NULL
FROM badge_rules
WHERE badge_code = 'lens-collector';

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
WHERE badge_code = 'alpha-owner';

COMMIT;
