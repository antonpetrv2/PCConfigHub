-- Performance seed for PCConfigHub.
-- Inserts 10,000 component rows based on real commercial PC part models,
-- plus 10,000 saved configurations for paging and index validation.
-- Run after drizzle migrations and the base seed.sql.

INSERT INTO import_batches (
  id,
  uploaded_by_user_id,
  file_name,
  status,
  total_rows,
  processed_rows,
  created_at,
  updated_at,
  completed_at
) VALUES (
  10000,
  1,
  'performance-real-parts-seed.sql',
  'completed',
  10000,
  10000,
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

WITH generated_parts AS (
  SELECT
    100000 + gs AS id,
    gs,
    CASE (gs % 8)
      WHEN 0 THEN 'motherboard'
      WHEN 1 THEN 'cpu'
      WHEN 2 THEN 'ram'
      WHEN 3 THEN 'storage'
      WHEN 4 THEN 'video_card'
      WHEN 5 THEN 'sound_card'
      WHEN 6 THEN 'case'
      ELSE 'power_supply'
    END AS component_type
  FROM generate_series(1, 10000) AS gs
)
INSERT INTO components (
  id,
  owner_user_id,
  type,
  name,
  manufacturer,
  model,
  description,
  visibility,
  approval_status,
  approved_by_user_id,
  approved_at,
  import_batch_id,
  created_at,
  updated_at
)
SELECT
  id,
  1,
  component_type::component_type,
  CASE component_type
    WHEN 'motherboard' THEN (ARRAY[
      'ASUS ROG Strix B650E-F Gaming WiFi',
      'MSI MAG B650 Tomahawk WiFi',
      'Gigabyte B650 AORUS Elite AX',
      'ASUS TUF Gaming X670E-Plus WiFi',
      'MSI PRO Z790-A WiFi',
      'Gigabyte Z790 AORUS Elite AX',
      'ASRock B550 Steel Legend',
      'ASUS ROG Strix B550-F Gaming WiFi II',
      'MSI B450 Tomahawk Max II',
      'Gigabyte B760M DS3H AX'
    ])[((gs - 1) % 10) + 1]
    WHEN 'cpu' THEN (ARRAY[
      'AMD Ryzen 5 5600X',
      'AMD Ryzen 7 5800X3D',
      'AMD Ryzen 5 7600',
      'AMD Ryzen 7 7800X3D',
      'AMD Ryzen 9 7950X',
      'Intel Core i5-12400F',
      'Intel Core i5-13600K',
      'Intel Core i7-13700K',
      'Intel Core i5-14600K',
      'Intel Core i9-14900K'
    ])[((gs - 1) % 10) + 1]
    WHEN 'ram' THEN (ARRAY[
      'Corsair Vengeance LPX 16GB DDR4-3200',
      'Corsair Vengeance RGB Pro 32GB DDR4-3600',
      'G.Skill Trident Z5 Neo 32GB DDR5-6000',
      'Kingston Fury Beast 32GB DDR5-5600',
      'Crucial Pro 32GB DDR5-5600',
      'Teamgroup T-Force Delta RGB 32GB DDR5-6000',
      'G.Skill Ripjaws V 16GB DDR4-3200',
      'Patriot Viper Steel 32GB DDR4-3600'
    ])[((gs - 1) % 8) + 1]
    WHEN 'storage' THEN (ARRAY[
      'Samsung 970 EVO Plus 1TB',
      'Samsung 980 Pro 2TB',
      'Samsung 990 Pro 2TB',
      'WD Black SN850X 2TB',
      'Crucial P3 Plus 1TB',
      'Crucial T500 2TB',
      'Kingston KC3000 2TB',
      'Seagate FireCuda 530 2TB'
    ])[((gs - 1) % 8) + 1]
    WHEN 'video_card' THEN (ARRAY[
      'NVIDIA GeForce RTX 3060 12GB',
      'NVIDIA GeForce RTX 4070 Super',
      'NVIDIA GeForce RTX 4080 Super',
      'NVIDIA GeForce RTX 4090',
      'AMD Radeon RX 6600',
      'AMD Radeon RX 7600',
      'AMD Radeon RX 7800 XT',
      'AMD Radeon RX 7900 XTX'
    ])[((gs - 1) % 8) + 1]
    WHEN 'sound_card' THEN (ARRAY[
      'Creative Sound Blaster Audigy FX',
      'Creative Sound Blaster Z SE',
      'Creative Sound BlasterX AE-5 Plus',
      'ASUS Xonar SE',
      'ASUS Xonar AE',
      'EVGA NU Audio Card'
    ])[((gs - 1) % 6) + 1]
    WHEN 'case' THEN (ARRAY[
      'Corsair 4000D Airflow',
      'Fractal Design Meshify 2 Compact',
      'NZXT H5 Flow',
      'Lian Li Lancool 216',
      'Phanteks Eclipse G360A',
      'Cooler Master MasterBox NR200P',
      'be quiet! Pure Base 500DX',
      'Fractal Design North'
    ])[((gs - 1) % 8) + 1]
    ELSE (ARRAY[
      'Corsair RM750x',
      'Corsair RM850x',
      'Seasonic Focus GX-750',
      'Seasonic Focus GX-850',
      'be quiet! Straight Power 12 850W',
      'EVGA SuperNOVA 750 G6',
      'Cooler Master V850 SFX Gold',
      'Thermaltake Toughpower GF3 1000W'
    ])[((gs - 1) % 8) + 1]
  END || ' #' || gs,
  CASE component_type
    WHEN 'motherboard' THEN (ARRAY['ASUS', 'MSI', 'Gigabyte', 'ASUS', 'MSI', 'Gigabyte', 'ASRock', 'ASUS', 'MSI', 'Gigabyte'])[((gs - 1) % 10) + 1]
    WHEN 'cpu' THEN (ARRAY['AMD', 'AMD', 'AMD', 'AMD', 'AMD', 'Intel', 'Intel', 'Intel', 'Intel', 'Intel'])[((gs - 1) % 10) + 1]
    WHEN 'ram' THEN (ARRAY['Corsair', 'Corsair', 'G.Skill', 'Kingston', 'Crucial', 'Teamgroup', 'G.Skill', 'Patriot'])[((gs - 1) % 8) + 1]
    WHEN 'storage' THEN (ARRAY['Samsung', 'Samsung', 'Samsung', 'Western Digital', 'Crucial', 'Crucial', 'Kingston', 'Seagate'])[((gs - 1) % 8) + 1]
    WHEN 'video_card' THEN (ARRAY['NVIDIA', 'NVIDIA', 'NVIDIA', 'NVIDIA', 'AMD', 'AMD', 'AMD', 'AMD'])[((gs - 1) % 8) + 1]
    WHEN 'sound_card' THEN (ARRAY['Creative', 'Creative', 'Creative', 'ASUS', 'ASUS', 'EVGA'])[((gs - 1) % 6) + 1]
    WHEN 'case' THEN (ARRAY['Corsair', 'Fractal Design', 'NZXT', 'Lian Li', 'Phanteks', 'Cooler Master', 'be quiet!', 'Fractal Design'])[((gs - 1) % 8) + 1]
    ELSE (ARRAY['Corsair', 'Corsair', 'Seasonic', 'Seasonic', 'be quiet!', 'EVGA', 'Cooler Master', 'Thermaltake'])[((gs - 1) % 8) + 1]
  END,
  'real-world performance seed',
  'Generated from a curated list of real PC hardware models for paging and search tests.',
  'public',
  'approved',
  1,
  now(),
  10000,
  now() - ((gs % 365) || ' days')::interval,
  now()
FROM generated_parts
ON CONFLICT (id) DO NOTHING;

INSERT INTO motherboard_details (
  component_id,
  cpu_socket,
  form_factor,
  ram_type,
  ram_slots,
  pci_slots,
  gpu_slot_type,
  sound_slot_type
)
SELECT
  id,
  CASE
    WHEN gs % 10 IN (0, 1, 2, 3) THEN 'AM5'
    WHEN gs % 10 IN (6, 7, 8) THEN 'AM4'
    ELSE 'LGA1700'
  END,
  CASE WHEN gs % 10 = 9 THEN 'Micro-ATX' ELSE 'ATX' END,
  CASE
    WHEN gs % 10 IN (6, 7, 8) THEN 'DDR4'
    ELSE 'DDR5'
  END,
  CASE WHEN gs % 5 = 0 THEN 2 ELSE 4 END,
  ARRAY['PCIe 4.0 x16', 'PCIe 4.0 x1'],
  'PCIe 4.0 x16',
  'PCIe 4.0 x1'
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 0
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO cpu_details (component_id, socket, tdp, cores, threads)
SELECT
  id,
  CASE
    WHEN gs % 10 BETWEEN 0 AND 4 THEN CASE WHEN gs % 10 IN (0, 1) THEN 'AM4' ELSE 'AM5' END
    ELSE 'LGA1700'
  END,
  (ARRAY[65, 105, 65, 120, 170, 65, 125, 125, 125, 253])[((gs - 1) % 10) + 1],
  (ARRAY[6, 8, 6, 8, 16, 6, 14, 16, 14, 24])[((gs - 1) % 10) + 1],
  (ARRAY[12, 16, 12, 16, 32, 12, 20, 24, 20, 32])[((gs - 1) % 10) + 1]
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 1
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO ram_details (component_id, type, capacity_gb, speed_mhz, slots)
SELECT
  id,
  CASE WHEN gs % 8 IN (0, 1, 6, 7) THEN 'DDR4' ELSE 'DDR5' END,
  (ARRAY[16, 32, 32, 32, 32, 32, 16, 32])[((gs - 1) % 8) + 1],
  (ARRAY[3200, 3600, 6000, 5600, 5600, 6000, 3200, 3600])[((gs - 1) % 8) + 1],
  CASE WHEN gs % 3 = 0 THEN 4 ELSE 2 END
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 2
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO storage_details (component_id, interface, capacity_gb, type)
SELECT
  id,
  'NVMe PCIe',
  (ARRAY[1000, 2000, 2000, 2000, 1000, 2000, 2000, 2000])[((gs - 1) % 8) + 1],
  'SSD'
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 3
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO video_card_details (component_id, slot_type, tdp, length_mm, vram_gb)
SELECT
  id,
  'PCIe 4.0 x16',
  (ARRAY[170, 220, 320, 450, 132, 165, 263, 355])[((gs - 1) % 8) + 1],
  (ARRAY[242, 267, 304, 336, 190, 204, 267, 287])[((gs - 1) % 8) + 1],
  (ARRAY[12, 12, 16, 24, 8, 8, 16, 24])[((gs - 1) % 8) + 1]
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 4
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO sound_card_details (component_id, slot_type)
SELECT id, 'PCIe 3.0 x1'
FROM (
  SELECT 100000 + gs AS id
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 5
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO case_details (component_id, form_factor, form_factors, psu_form_factor, max_gpu_length)
SELECT
  id,
  CASE WHEN gs % 8 = 5 THEN 'Mini-ITX' ELSE 'ATX' END,
  CASE WHEN gs % 8 = 5 THEN ARRAY['Mini-ITX'] ELSE ARRAY['ATX', 'Micro-ATX', 'Mini-ITX'] END,
  CASE WHEN gs % 8 = 5 THEN 'sfx' ELSE 'atx' END,
  (ARRAY[360, 341, 365, 392, 400, 330, 369, 355])[((gs - 1) % 8) + 1]
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 6
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO power_supply_details (component_id, psu_type, form_factor, modular, wattage)
SELECT
  id,
  CASE WHEN gs % 8 = 6 THEN 'sfx'::psu_type ELSE 'atx'::psu_type END,
  CASE WHEN gs % 8 = 6 THEN 'sfx' ELSE 'atx' END,
  true,
  (ARRAY[750, 850, 750, 850, 850, 750, 850, 1000])[((gs - 1) % 8) + 1]
FROM (
  SELECT 100000 + gs AS id, gs
  FROM generate_series(1, 10000) AS gs
  WHERE gs % 8 = 7
) rows
ON CONFLICT (component_id) DO NOTHING;

INSERT INTO pc_configurations (
  id,
  owner_user_id,
  name,
  description,
  visibility,
  approval_status,
  approved_by_user_id,
  approved_at,
  created_at,
  updated_at
)
SELECT
  200000 + gs,
  1,
  (ARRAY[
    '1440p Gaming Build',
    'Creator Workstation',
    'Quiet Productivity PC',
    'Compact Living Room PC',
    'Streaming and Gaming Rig',
    'Budget Esports Build',
    'High Refresh Rate Build',
    'Developer Workstation'
  ])[((gs - 1) % 8) + 1] || ' #' || gs,
  'Generated performance configuration using real PC part families.',
  'public',
  'approved',
  1,
  now(),
  now() - ((gs % 365) || ' days')::interval,
  now()
FROM generate_series(1, 10000) AS gs
ON CONFLICT (id) DO NOTHING;

WITH config_rows AS (
  SELECT
    200000 + gs AS config_id,
    gs,
    100000 + ((((gs - 1) % 1249) * 8) + 8) AS base_part_id
  FROM generate_series(1, 10000) AS gs
)
INSERT INTO pc_configuration_components (
  pc_configuration_id,
  component_id,
  quantity,
  slot_label,
  added_at
)
SELECT config_id, base_part_id + 0, 1, 'Motherboard', now() FROM config_rows
UNION ALL
SELECT config_id, base_part_id + 1, 1, 'CPU', now() FROM config_rows
UNION ALL
SELECT config_id, base_part_id + 2, 1, 'RAM', now() FROM config_rows
UNION ALL
SELECT config_id, base_part_id + 3, 1, 'Storage', now() FROM config_rows
UNION ALL
SELECT config_id, base_part_id + 4, 1, 'GPU', now() FROM config_rows
UNION ALL
SELECT config_id, base_part_id + 6, 1, 'Case', now() FROM config_rows
UNION ALL
SELECT config_id, base_part_id + 7, 1, 'Power supply', now() FROM config_rows
ON CONFLICT (pc_configuration_id, component_id) DO NOTHING;

SELECT setval('import_batches_id_seq', GREATEST((SELECT max(id) FROM import_batches), 10000), true);
SELECT setval('components_id_seq', GREATEST((SELECT max(id) FROM components), 110000), true);
SELECT setval('pc_configurations_id_seq', GREATEST((SELECT max(id) FROM pc_configurations), 210000), true);
SELECT setval('pc_configuration_components_id_seq', GREATEST((SELECT max(id) FROM pc_configuration_components), 1), true);
