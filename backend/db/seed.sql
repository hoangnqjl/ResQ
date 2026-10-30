INSERT IGNORE INTO users (id, full_name, email, role, is_incognito, dietary_preferences, allergies)
VALUES
('11111111-1111-4111-8111-111111111111', 'ResQ Demo Buyer', 'buyer.demo@resq.local', 'buyer', FALSE, JSON_ARRAY('vegetarian-friendly'), JSON_ARRAY('peanuts')),
('22222222-2222-4222-8222-222222222222', 'ResQ Demo Kitchen', 'seller.demo@resq.local', 'seller', FALSE, JSON_ARRAY(), JSON_ARRAY());

INSERT IGNORE INTO shops (id, owner_id, name, description, address, latitude, longitude, verified, reputation_score)
VALUES ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'ResQ Demo Kitchen', 'Surplus meals prepared fresh each day.', 'Tran Dai Nghia Street, Ngu Hanh Son Ward', 15.974800, 108.250000, FALSE, 4.8);

INSERT IGNORE INTO food_items (id, shop_id, name, description, image_url, original_price, current_price, quantity_available, allergens, storage_instructions, prepared_at, expires_at, pickup_starts_at, pickup_ends_at, status)
VALUES
('44444444-4444-4444-8444-444444444441', '33333333-3333-4333-8333-333333333333', 'Grilled Chicken Rice', 'Grilled chicken, fresh greens and rice. Prepared today.', '{{grilled-chicken-rice.jpg}}', 65000, 35000, 6, JSON_ARRAY('soy'), 'Ready to eat. Keep chilled if not eating immediately.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'),
('44444444-4444-4444-8444-444444444442', '33333333-3333-4333-8333-333333333333', 'Salmon Poke Bowl', 'Salmon, avocado, cucumber and rice. Keep chilled.', '{{salmon-poke-bowl.jpg}}', 89000, 49000, 4, JSON_ARRAY('fish', 'soy', 'sesame'), 'Keep refrigerated. Consume within 2 hours after pickup.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active'),
('44444444-4444-4444-8444-444444444443', '33333333-3333-4333-8333-333333333333', 'Chicken Pho', 'Warm chicken noodle soup with fresh herbs.', '{{chicken-pho.jpg}}', 55000, 29000, 5, JSON_ARRAY('soy', 'wheat'), 'Reheat until steaming hot before serving.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), 'active'),
('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 'Berry Pancakes', 'Pancakes topped with seasonal berries and yogurt.', '{{berry-pancakes.jpg}}', 60000, 32000, 3, JSON_ARRAY('milk', 'egg', 'wheat'), 'Best enjoyed today. Reheat for 30 seconds.', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active');
