-- Minimal seed data for PCConfigHub

INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  role,
  approval_status,
  approved_by_user_id,
  approved_at,
  created_at,
  updated_at
) VALUES
  (1, 'admin@pcconfighub.test', 'bcrypt$2b$10$adminplaceholder', 'Admin', 'admin', 'approved', 1, now(), now(), now()),
  (2, 'moderator@pcconfighub.test', 'bcrypt$2b$10$modplaceholder', 'Moderator', 'moderator', 'approved', 1, now(), now(), now()),
  (3, 'user@pcconfighub.test', 'bcrypt$2b$10$userplaceholder', 'User', 'user', 'approved', 1, now(), now(), now());

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
) VALUES
  (1, 3, 'seed-import.csv', 'completed', 2, 2, now(), now(), now());

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
) VALUES
  (1, 3, 'motherboard', 'Atlas Z790', 'Atlas', 'Z790-A', 'ATX motherboard for Intel sockets.', 'public', 'approved', 1, now(), 1, now(), now()),
  (2, 3, 'video_card', 'Nova RTX 4080', 'Nova', 'RTX-4080', 'High-end GPU for 4K gaming.', 'public', 'approved', 1, now(), 1, now(), now()),
  (3, 3, 'sound_card', 'Echo X1', 'Echo', 'X1', 'PCIe sound card.', 'public', 'approved', 1, now(), 1, now(), now()),
  (4, 3, 'case', 'Tower Pro', 'Forge', 'TP-01', 'Mid-tower case.', 'public', 'approved', 1, now(), 1, now(), now()),
  (5, 3, 'power_supply', 'Volt 750W', 'Volt', 'V750', '750W PSU.', 'public', 'approved', 1, now(), 1, now(), now());

INSERT INTO motherboard_details (
  component_id,
  cpu_socket,
  ram_type,
  ram_slots,
  gpu_slot_type,
  sound_slot_type
) VALUES
  (1, 'LGA1700', 'DDR5', 4, 'PCIe 4.0 x16', 'PCIe 4.0 x1');

INSERT INTO video_card_details (component_id, slot_type, vram_gb) VALUES
  (2, 'PCIe 4.0 x16', 16);

INSERT INTO sound_card_details (component_id, slot_type) VALUES
  (3, 'PCIe 4.0 x1');

INSERT INTO case_details (component_id, form_factor) VALUES
  (4, 'ATX');

INSERT INTO case_supported_psu_types (id, case_component_id, psu_type) VALUES
  (1, 4, 'atx'),
  (2, 4, 'sfx');

INSERT INTO power_supply_details (component_id, psu_type, wattage) VALUES
  (5, 'atx', 750);

INSERT INTO component_images (
  id,
  component_id,
  url,
  alt_text,
  sort_order,
  created_at
) VALUES
  (1, 1, 'https://example.com/images/mobo.png', 'Motherboard image', 0, now()),
  (2, 2, 'https://example.com/images/gpu.png', 'GPU image', 0, now());

INSERT INTO import_rows (
  id,
  import_batch_id,
  row_number,
  raw_data,
  status,
  component_type,
  component_id,
  created_at
) VALUES
  (1, 1, 1, '{"type":"motherboard","name":"Atlas Z790"}', 'processed', 'motherboard', 1, now()),
  (2, 1, 2, '{"type":"video_card","name":"Nova RTX 4080"}', 'processed', 'video_card', 2, now());

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
) VALUES
  (1, 3, 'Gaming Build', 'Balanced 1440p gaming build.', 'public', 'approved', 1, now(), now(), now());

INSERT INTO pc_configuration_components (
  id,
  pc_configuration_id,
  component_id,
  quantity,
  slot_label,
  added_at
) VALUES
  (1, 1, 1, 1, 'Motherboard', now()),
  (2, 1, 2, 1, 'GPU', now()),
  (3, 1, 5, 1, 'PSU', now());

INSERT INTO comments (
  id,
  author_user_id,
  component_id,
  body,
  approval_status,
  approved_by_user_id,
  approved_at,
  created_at,
  updated_at
) VALUES
  (1, 3, 2, 'Great performance for the price.', 'approved', 2, now(), now(), now());

SELECT setval('users_id_seq', 3, true);
SELECT setval('import_batches_id_seq', 1, true);
SELECT setval('components_id_seq', 5, true);
SELECT setval('case_supported_psu_types_id_seq', 2, true);
SELECT setval('component_images_id_seq', 2, true);
SELECT setval('import_rows_id_seq', 2, true);
SELECT setval('pc_configurations_id_seq', 1, true);
SELECT setval('pc_configuration_components_id_seq', 3, true);
SELECT setval('comments_id_seq', 1, true);
