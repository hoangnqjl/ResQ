INSERT IGNORE INTO users (id, full_name, email, role, is_incognito, dietary_preferences, allergies)
VALUES
('11111111-1111-4111-8111-111111111111', 'ResQ Demo Buyer', 'buyer.demo@resq.local', 'buyer', FALSE, JSON_ARRAY('vegetarian-friendly'), JSON_ARRAY('peanuts')),
('22222222-2222-4222-8222-222222222222', 'ResQ Demo Kitchen', 'seller.demo@resq.local', 'seller', FALSE, JSON_ARRAY(), JSON_ARRAY());

INSERT INTO shops (id, owner_id, name, description, address, latitude, longitude, verified, reputation_score)
VALUES
('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'ResQ Demo Kitchen', 'Surplus meals prepared fresh each day.', 'Tran Dai Nghia Street, Ngu Hanh Son Ward', 15.974800, 108.250000, FALSE, 4.8),
('33333333-3333-4333-8333-333333333334', '22222222-2222-4222-8222-222222222222', 'Green Bowl Kitchen', 'Fresh vegetarian bowls available for pickup.', 'Le Van Hien Street, Ngu Hanh Son Ward', 15.968800, 108.258000, TRUE, 4.8),
('33333333-3333-4333-8333-333333333335', '22222222-2222-4222-8222-222222222222', 'Binh Thanh Noodle Kitchen', 'Demo listing for the search-results design.', 'Binh Thanh · 3.4 km', 10.801400, 106.710900, TRUE, 4.8),
('33333333-3333-4333-8333-333333333336', '22222222-2222-4222-8222-222222222222', 'The Corner Kitchen', 'Demo shop for the saved-shop design.', 'District 1 · 1.2 km', 10.776900, 106.700900, TRUE, 4.8),
('33333333-3333-4333-8333-333333333337', '22222222-2222-4222-8222-222222222222', 'Station 1 0đ BreadCabinet', 'Community bread and meal station, free for everyone.', 'Ngu Hanh Son Ward', 15.974800, 108.250000, TRUE, 4.8),
('33333333-3333-4333-8333-333333333338', '22222222-2222-4222-8222-222222222222', 'Le Croissant Saigon', 'Demo shop for the Drop Alert Center design.', 'Dist 1 · 1.2 km · Pastry & Bread', 10.776900, 106.700900, TRUE, 4.8),
('33333333-3333-4333-8333-333333333339', '22222222-2222-4222-8222-222222222222', 'Green Bowl Healthy Deli', 'Demo shop for the Drop Alert Center design.', 'Dist 3 · 850m · Vegan friendly', 10.782900, 106.693200, TRUE, 4.8),
('33333333-3333-4333-8333-333333333340', '22222222-2222-4222-8222-222222222222', 'Tokyo Bento Box Station', 'Demo shop for the Drop Alert Center design.', 'Binh Thanh · 2.1 km · Cooked meals', 10.801400, 106.710900, TRUE, 4.8),
('33333333-3333-4333-8333-333333333341', '22222222-2222-4222-8222-222222222222', 'Morning Brew Cafe', 'Demo shop for the saved-shop alert design.', 'District 3 · 2.4 km', 10.782900, 106.693200, TRUE, 4.8),
('33333333-3333-4333-8333-333333333342', '22222222-2222-4222-8222-222222222222', 'Green Bowl Studio', 'Demo shop for the saved-shop alert design.', 'Binh Thanh · 3.1 km', 10.801400, 106.710900, TRUE, 4.8)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  address = VALUES(address),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  verified = VALUES(verified),
  reputation_score = VALUES(reputation_score);

INSERT INTO food_items (id, shop_id, name, description, image_url, original_price, current_price, quantity_available, allergens, storage_instructions, prepared_at, expires_at, pickup_starts_at, pickup_ends_at, status)
VALUES
('44444444-4444-4444-8444-444444444441', '33333333-3333-4333-8333-333333333333', 'Grilled Chicken Rice', 'Grilled chicken, fresh greens and rice. Prepared today.', '{{grilled-chicken-rice.jpg}}', 65000, 35000, 3, JSON_ARRAY('soy'), 'Ready to eat. Keep chilled if not eating immediately.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444442', '33333333-3333-4333-8333-333333333333', 'Salmon Poke Bowl', 'Salmon, avocado, cucumber and rice. Keep chilled.', '{{salmon-poke-bowl.jpg}}', 89000, 49000, 3, JSON_ARRAY('fish', 'soy', 'sesame'), 'Keep refrigerated. Consume within 2 hours after pickup.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444443', '33333333-3333-4333-8333-333333333333', 'Chicken Pho', 'Warm chicken noodle soup with fresh herbs.', '{{chicken-pho.jpg}}', 55000, 29000, 3, JSON_ARRAY('soy', 'wheat'), 'Reheat until steaming hot before serving.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 'Berry Pancakes', 'Pancakes topped with seasonal berries and yogurt.', '{{berry-pancakes.jpg}}', 60000, 32000, 3, JSON_ARRAY('milk', 'egg', 'wheat'), 'Best enjoyed today. Reheat for 30 seconds.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444445', '33333333-3333-4333-8333-333333333334', 'Vegetarian Garden Bowl', 'A fresh vegetarian bowl with seasonal vegetables and rice.', '{{vegetarian-garden-bowl.jpg}}', 65000, 35000, 5, JSON_ARRAY(), 'Ready to eat. Keep chilled if not eating immediately.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444446', '33333333-3333-4333-8333-333333333335', 'Grilled Chicken Rice', 'Grilled chicken, fresh greens and rice. Prepared today.', '{{grilled-chicken-rice.jpg}}', 350000, 212500, 3, JSON_ARRAY('soy'), 'Ready to eat. Keep chilled if not eating immediately.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444447', '33333333-3333-4333-8333-333333333335', 'Salmon Poke Bowl', 'Salmon, avocado, cucumber and rice. Keep chilled.', '{{salmon-poke-bowl.jpg}}', 440000, 275000, 3, JSON_ARRAY('fish', 'soy', 'sesame'), 'Keep refrigerated. Consume within 2 hours after pickup.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444448', '33333333-3333-4333-8333-333333333335', 'Spicy Beef Noodles', 'Spicy beef noodles with herbs and fresh vegetables.', NULL, 360000, 231250, 3, JSON_ARRAY('soy', 'wheat'), 'Keep chilled and reheat until steaming hot.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444449', '33333333-3333-4333-8333-333333333335', 'Berry Pancakes', 'Pancakes topped with seasonal berries and yogurt.', '{{berry-pancakes.jpg}}', 300000, 195000, 3, JSON_ARRAY('milk', 'egg', 'wheat'), 'Best enjoyed today. Reheat for 30 seconds.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444450', '33333333-3333-4333-8333-333333333335', 'Avocado Toast', 'Avocado toast topped with tomato and fresh herbs.', NULL, 250000, 175000, 3, JSON_ARRAY('wheat'), 'Keep chilled and enjoy today.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444451', '33333333-3333-4333-8333-333333333335', 'Truffle Pasta', 'Creamy truffle pasta with mushrooms and parmesan.', NULL, 390000, 256250, 3, JSON_ARRAY('milk', 'wheat'), 'Keep chilled and reheat until steaming hot.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444452', '33333333-3333-4333-8333-333333333337', 'Vegetable rice box', 'Vegetarian rice box with vegetables and tofu.', NULL, 0, 0, 2, JSON_ARRAY('soy'), 'Ready to eat. Keep chilled if not eating immediately.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444453', '33333333-3333-4333-8333-333333333337', 'Fresh bread set', 'Fresh bread with vegetables and herbs.', NULL, 0, 0, 2, JSON_ARRAY('wheat'), 'Ready to eat. Keep chilled if not eating immediately.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444454', '33333333-3333-4333-8333-333333333337', 'Noodle soup', 'Beef noodle soup with fresh herbs.', NULL, 0, 0, 2, JSON_ARRAY('soy', 'wheat'), 'Reheat until steaming hot before serving.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444455', '33333333-3333-4333-8333-333333333337', 'Pizza mushroom', 'Mushroom pizza with tomato and basil.', NULL, 0, 0, 2, JSON_ARRAY('milk', 'wheat'), 'Reheat before serving.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444456', '33333333-3333-4333-8333-333333333336', 'Chef''s surprise box', 'A chef''s surprise box with 2–3 fresh items, available for pickup tonight.', NULL, 200000, 80000, 3, JSON_ARRAY(), 'Keep chilled and enjoy tonight.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active')
ON DUPLICATE KEY UPDATE
  shop_id = VALUES(shop_id),
  name = VALUES(name),
  description = VALUES(description),
  image_url = VALUES(image_url),
  original_price = VALUES(original_price),
  current_price = VALUES(current_price),
  quantity_available = VALUES(quantity_available),
  allergens = VALUES(allergens),
  storage_instructions = VALUES(storage_instructions),
  prepared_at = VALUES(prepared_at),
  expires_at = VALUES(expires_at),
  pickup_starts_at = VALUES(pickup_starts_at),
  pickup_ends_at = VALUES(pickup_ends_at),
  status = VALUES(status);
