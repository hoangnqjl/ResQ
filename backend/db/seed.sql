-- ==============================================================================
-- RESQ COMPREHENSIVE SEED DATA
-- Rich sample database with 12 shops, 32 food surplus items, safety permits & waitlists
-- ==============================================================================

-- 1. USERS
INSERT IGNORE INTO users (id, full_name, email, role, is_incognito, dietary_preferences, allergies)
VALUES
('11111111-1111-4111-8111-111111111111', 'Nguyen Capybaras', 'quynh23@email.com', 'buyer', FALSE, JSON_ARRAY('Non-vegetarian'), JSON_ARRAY('Milk', 'Seafood')),
('22222222-2222-4222-8222-222222222222', 'The Corner Kitchen Admin', 'merchant@cornerkitchen.vn', 'seller', FALSE, JSON_ARRAY(), JSON_ARRAY()),
('11111111-1111-4111-8111-111111111112', 'Tran Bao Long', 'long.tran@resq.local', 'buyer', FALSE, JSON_ARRAY('Vegetarian'), JSON_ARRAY('Peanuts')),
('11111111-1111-4111-8111-111111111113', 'Le Hoang Nam', 'nam.le@resq.local', 'buyer', FALSE, JSON_ARRAY(), JSON_ARRAY()),
('11111111-1111-4111-8111-111111111114', 'Mai Phuong Thao', 'thao.mai@resq.local', 'buyer', FALSE, JSON_ARRAY('Halal'), JSON_ARRAY('Soy'));

-- 2. SHOPS
INSERT INTO shops (id, owner_id, name, description, address, latitude, longitude, verified, reputation_score)
VALUES
('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'ResQ Central Kitchen', 'Surplus meals prepared fresh each day with certified ingredients.', 'Tran Dai Nghia Street, Ngu Hanh Son, Da Nang', 15.974800, 108.250000, TRUE, 4.9),
('33333333-3333-4333-8333-333333333334', '22222222-2222-4222-8222-222222222222', 'Green Bowl Healthy Deli', 'Fresh vegetarian bowls, organic salads and detox juices.', '45 Le Van Hien, Ngu Hanh Son, Da Nang', 15.968800, 108.258000, TRUE, 4.8),
('33333333-3333-4333-8333-333333333335', '22222222-2222-4222-8222-222222222222', 'Binh Thanh Noodle House', 'Traditional Vietnamese noodle soups with rich broth and fresh herbs.', '120 Xo Viet Nghe Tinh, Binh Thanh · 3.4 km', 10.801400, 106.710900, TRUE, 4.7),
('33333333-3333-4333-8333-333333333336', '22222222-2222-4222-8222-222222222222', 'The Corner Kitchen', 'Signature bakery and gourmet comfort meals at evening rescue discounts.', '88 Nguyen Hue, District 1 · 1.2 km', 10.776900, 106.700900, TRUE, 4.9),
('33333333-3333-4333-8333-333333333337', '22222222-2222-4222-8222-222222222222', 'Station 1: 0đ Community Food Cabinet', 'Community bread and warm meal sharing station, 100% free for everyone.', '12 Tran Dai Nghia, Ngu Hanh Son Ward', 15.974800, 108.250000, TRUE, 5.0),
('33333333-3333-4333-8333-333333333338', '22222222-2222-4222-8222-222222222222', 'Le Croissant Saigon Bakery', 'Artisan sourdough, butter croissants, baguettes and fruit danishes.', '42 Dong Khoi, District 1 · 1.5 km', 10.776900, 106.700900, TRUE, 4.9),
('33333333-3333-4333-8333-333333333339', '22222222-2222-4222-8222-222222222222', 'Tokyo Bento Box & Sushi', 'Fresh sushi rolls, salmon nigiri, and teriyaki lunch boxes.', '18 Le Thanh Ton, District 1 · 1.8 km', 10.782900, 106.693200, TRUE, 4.8),
('33333333-3333-4333-8333-333333333340', '22222222-2222-4222-8222-222222222222', 'Morning Brew & Pastry Cafe', 'Specialty coffee, cinnamon rolls and artisan breakfast sandwiches.', '72 Vo Van Tan, District 3 · 2.4 km', 10.782900, 106.693200, TRUE, 4.7),
('33333333-3333-4333-8333-333333333341', '22222222-2222-4222-8222-222222222222', 'Woodfire Artisan Pizza Co.', 'Neapolitan sourdough pizzas with fresh mozzarella and basil.', '15 Thao Dien, District 2 · 3.8 km', 10.803500, 106.732500, TRUE, 4.8),
('33333333-3333-4333-8333-333333333342', '22222222-2222-4222-8222-222222222222', 'Saigon Organic Produce Hub', 'Daily rescued organic vegetables, seasonal fruits and farm produce.', '25 Hoang Sa, District 1 · 2.0 km', 10.791500, 106.698000, TRUE, 4.9)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  address = VALUES(address),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  verified = VALUES(verified),
  reputation_score = VALUES(reputation_score);

-- 3. FOOD SURPLUS ITEMS WITH PHOTOS & FULL SAFETY DETAILS
INSERT INTO food_items (
  id, shop_id, name, description, image_url, original_price, current_price, quantity_available,
  allergens, storage_instructions, storage_type, label_image_url, reheating_instructions, refrigeration_requirement,
  origin_info, seller_commitments, prepared_at, expires_at, pickup_starts_at, pickup_ends_at, status
)
VALUES
-- Item 1: Grilled Chicken Rice
(
  '44444444-4444-4444-8444-444444444441', '33333333-3333-4333-8333-333333333333',
  'Grilled Chicken Rice', 'Tender grilled chicken thigh with fragrant turmeric rice, scallion oil, and house dipping sauce.',
  '{{grilled-chicken-rice.jpg}}', 65000, 35000, 4,
  JSON_ARRAY('Soy'), 'Ready to eat. Keep chilled at 0-4°C if not consuming immediately.', 'refrigerated',
  '{{grilled-chicken-rice.jpg}}', 'Microwave 2 minutes on high (800W) or steam for 5 minutes until piping hot.',
  'Keep refrigerated at 0–4°C. Consume within 2 hours after opening packaging.',
  JSON_OBJECT(
    'business_permit', 'DN-2025-8841', 'certificate_no', 'FS-2026-0184', 'issue_date', '2026-01-15',
    'inspected_by', 'Da Nang Food Safety & Quality Bureau', 'activity_start', '2024-05-10', 'ingredient_source', 'VietGAP certified poultry farm'
  ),
  JSON_ARRAY('100% fresh chicken prepared on the day', 'Standard temperature monitored kitchen', 'Sealed tamper-proof takeaway packaging'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active'
),

-- Item 2: Salmon Poke Bowl
(
  '44444444-4444-4444-8444-444444444442', '33333333-3333-4333-8333-333333333333',
  'Fresh Salmon Poke Bowl', 'Sashimi-grade Norwegian salmon cubes, ripe avocado, edamame, and Japanese sushi rice with ponzu sesame dressing.',
  '{{salmon-poke-bowl.jpg}}', 89000, 49000, 3,
  JSON_ARRAY('Fish', 'Soy', 'Sesame'), 'Strictly keep refrigerated under 4°C. Do not freeze.', 'refrigerated',
  '{{salmon-poke-bowl.jpg}}', 'Do not reheat. Best enjoyed cold immediately after pickup.',
  'Keep in cooler bag with ice gel. Consume within 90 minutes of pickup.',
  JSON_OBJECT(
    'business_permit', 'DN-2025-8841', 'certificate_no', 'FS-2026-0184', 'issue_date', '2026-01-15',
    'inspected_by', 'Da Nang Food Safety Bureau', 'activity_start', '2024-05-10', 'ingredient_source', 'Imported Norwegian salmon with cold-chain cert'
  ),
  JSON_ARRAY('Inspected sashimi grade freshness', 'Continuous cold chain maintenance', 'Direct counter pickup'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 HOUR), 'active'
),

-- Item 3: Warm Chicken Pho
(
  '44444444-4444-4444-8444-444444444443', '33333333-3333-4333-8333-333333333333',
  'Traditional Chicken Pho', 'Handmade pho noodles, shredded organic chicken breast, clear simmering broth, and lime herbs garnish.',
  '{{chicken-pho.jpg}}', 55000, 29000, 5,
  JSON_ARRAY('Wheat'), 'Keep broth separate from noodles. Keep warm or refrigerate.', 'room_temperature',
  '{{chicken-pho.jpg}}', 'Bring broth to a rolling boil before pouring over noodles.',
  'Consume within 2 hours if kept at room temperature.',
  JSON_OBJECT(
    'business_permit', 'DN-2025-8841', 'certificate_no', 'FS-2026-0184', 'issue_date', '2026-01-15',
    'inspected_by', 'Da Nang Food Safety Bureau', 'activity_start', '2024-05-10', 'ingredient_source', 'Traditional free-range chicken'
  ),
  JSON_ARRAY('Broth simmered for 8+ hours', 'No synthetic MSG added', 'Separated noodle & broth packing'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), 'active'
),

-- Item 4: Berry Souffle Pancakes
(
  '44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333',
  'Berry Souffle Pancakes', 'Fluffy Japanese style pancakes topped with blueberries, strawberries, and vanilla Greek yogurt.',
  '{{berry-pancakes.jpg}}', 60000, 32000, 3,
  JSON_ARRAY('Milk', 'Egg', 'Wheat'), 'Keep covered at room temperature. Best enjoyed fresh.', 'room_temperature',
  '{{berry-pancakes.jpg}}', 'Warm in microwave for 20 seconds for ideal softness.',
  'Consume within 4 hours of baking.',
  JSON_OBJECT(
    'business_permit', 'DN-2025-8841', 'certificate_no', 'FS-2026-0184', 'issue_date', '2026-01-15',
    'inspected_by', 'Da Nang Food Safety Bureau', 'activity_start', '2024-05-10', 'ingredient_source', 'Pasteurized eggs and imported butter'
  ),
  JSON_ARRAY('Baked fresh in morning batch', 'Real fruit toppings', 'Compostable box container'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), 'active'
),

-- Item 5: Vegetarian Garden Rice Bowl
(
  '44444444-4444-4444-8444-444444444445', '33333333-3333-4333-8333-333333333334',
  'Organic Garden Harvest Bowl', 'Steamed brown rice, crispy pan-seared tofu, roasted sweet potato, baby spinach, and sesame tahini.',
  '{{vegetarian-garden-bowl.jpg}}', 65000, 35000, 6,
  JSON_ARRAY('Soy', 'Sesame'), 'Keep chilled if eating later.', 'refrigerated',
  '{{vegetarian-garden-bowl.jpg}}', 'Heat for 1.5 minutes or enjoy cool as grain salad.',
  'Refrigerate at 2-5°C.',
  JSON_OBJECT(
    'business_permit', 'DN-2024-5501', 'certificate_no', 'FS-2026-0921', 'issue_date', '2026-02-01',
    'inspected_by', 'Da Nang Dept of Health', 'activity_start', '2023-09-01', 'ingredient_source', 'Da Lat organic vegetable co-op'
  ),
  JSON_ARRAY('100% plant-based vegetarian friendly', 'Zero chemical preservatives', 'High fiber certified meal'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), 'active'
),

-- Item 6: Spicy Beef Noodles
(
  '44444444-4444-4444-8444-444444444448', '33333333-3333-4333-8333-333333333335',
  'Spicy Beef Hue Noodles', 'Thick rice vermicelli with tender braised beef shank, lemongrass chili broth, and fresh banana blossom.',
  '{{food-beef-noodles.jpg}}', 65000, 38000, 4,
  JSON_ARRAY('Soy', 'Wheat'), 'Reheat broth until bubbling hot before combining with noodles.', 'room_temperature',
  '{{food-beef-noodles.jpg}}', 'Reheat soup in pot for 3-4 minutes to 85°C.',
  'Consume within 2 hours of pickup.',
  JSON_OBJECT(
    'business_permit', 'HCM-2024-7729', 'certificate_no', 'FS-2026-0311', 'issue_date', '2026-01-20',
    'inspected_by', 'Ho Chi Minh Food Safety Management', 'activity_start', '2023-11-15', 'ingredient_source', 'Inspected Australian beef shank'
  ),
  JSON_ARRAY('Slow-cooked bone marrow broth', 'Fresh vermicelli pressed daily', 'Authentic spicy recipe'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), 'active'
),

-- Item 7: Avocado Poached Egg Toast
(
  '44444444-4444-4444-8444-444444444450', '33333333-3333-4333-8333-333333333336',
  'Sourdough Avocado & Poached Egg', 'Crushed Hass avocado on toasted sourdough, organic runny poached egg, chia seeds and chili flakes.',
  '{{food-avocado-toast.jpg}}', 75000, 42000, 3,
  JSON_ARRAY('Egg', 'Wheat'), 'Keep cool and consume promptly for best texture.', 'room_temperature',
  '{{food-avocado-toast.jpg}}', 'Best eaten fresh. Do not microwave whole egg.',
  'Consume within 90 minutes of pickup.',
  JSON_OBJECT(
    'business_permit', 'HCM-2023-9912', 'certificate_no', 'FS-2026-0742', 'issue_date', '2026-02-10',
    'inspected_by', 'District 1 Health Authority', 'activity_start', '2022-04-01', 'ingredient_source', 'Naturally leavened sourdough bakery'
  ),
  JSON_ARRAY('Freshly sliced avocado', 'Free range organic eggs', 'Eco-friendly kraft packaging'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 HOUR), 'active'
),

-- Item 8: Truffle Cream Fettuccine
(
  '44444444-4444-4444-8444-444444444451', '33333333-3333-4333-8333-333333333336',
  'Truffle Mushroom Fettuccine', 'Handmade egg fettuccine in creamy black truffle sauce with wild button mushrooms and shaved Grana Padano.',
  '{{food-truffle-pasta.jpg}}', 95000, 52000, 4,
  JSON_ARRAY('Milk', 'Egg', 'Wheat'), 'Refrigerate if not eating within 1 hour.', 'refrigerated',
  '{{food-truffle-pasta.jpg}}', 'Microwave 1.5 min with 1 tablespoon of water to loosen the cream sauce.',
  'Keep at 0-4°C if stored.',
  JSON_OBJECT(
    'business_permit', 'HCM-2023-9912', 'certificate_no', 'FS-2026-0742', 'issue_date', '2026-02-10',
    'inspected_by', 'District 1 Health Authority', 'activity_start', '2022-04-01', 'ingredient_source', 'Imported Italian truffle cream & pasta'
  ),
  JSON_ARRAY('Handmade pasta strands', 'Rich gourmet truffle butter aroma', 'Strict temperature compliance'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active'
),

-- Item 9: Traditional Saigon Crispy Banh Mi
(
  '44444444-4444-4444-8444-444444444460', '33333333-3333-4333-8333-333333333338',
  'Saigon Special Crispy Banh Mi', 'Crispy warm baguette loaded with French butter pate, pork ham, pickled daikon carrots, and cilantro.',
  '{{food-banh-mi.jpg}}', 40000, 22000, 8,
  JSON_ARRAY('Wheat', 'Soy'), 'Keep in dry paper bag. Re-toast in oven for 2 minutes to restore crunchiness.', 'room_temperature',
  '{{food-banh-mi.jpg}}', 'Oven toast at 180°C for 2 minutes or pan-press lightly.',
  'Consume within 4 hours of baking.',
  JSON_OBJECT(
    'business_permit', 'HCM-2024-1184', 'certificate_no', 'FS-2026-0552', 'issue_date', '2026-01-08',
    'inspected_by', 'Saigon Food Inspection Department', 'activity_start', '2021-08-15', 'ingredient_source', 'House-made pate and artisanal baguette'
  ),
  JSON_ARRAY('Baguettes baked every 3 hours', 'Clean artisanal processing', 'Safe pork cold-cut certification'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), 'active'
),

-- Item 10: Neapolitan Margherita Pizza
(
  '44444444-4444-4444-8444-444444444461', '33333333-3333-4333-8333-333333333341',
  'Artisan Margherita Sourdough Pizza', '48-hour fermented sourdough crust, San Marzano tomato sauce, fresh buffalo mozzarella, and aromatic basil.',
  '{{food-pizza.jpg}}', 120000, 65000, 4,
  JSON_ARRAY('Milk', 'Wheat'), 'Keep in pizza carton. Reheat in skillet or air fryer for best bottom crisp.', 'room_temperature',
  '{{food-pizza.jpg}}', 'Air fry 3 minutes at 180°C or pan-sear covered for 4 minutes.',
  'Consume within 3 hours after bake.',
  JSON_OBJECT(
    'business_permit', 'HCM-2024-3392', 'certificate_no', 'FS-2026-0418', 'issue_date', '2026-02-18',
    'inspected_by', 'District 2 Health Division', 'activity_start', '2023-01-10', 'ingredient_source', 'Italian imported flour & tomatoes'
  ),
  JSON_ARRAY('Baked at 450°C wood oven', 'Zero artificial leavening agents', 'Vegetarian-friendly cheese'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), 'active'
),

-- Item 11: French Butter Croissant Box (Set of 3)
(
  '44444444-4444-4444-8444-444444444462', '33333333-3333-4333-8333-333333333338',
  'Flaky Butter Croissant Trio Box', 'Box of 3 golden flaky French croissants made with 82% Normandy butter. Perfect with tea or coffee.',
  '{{croissant-box.jpg}}', 85000, 45000, 5,
  JSON_ARRAY('Milk', 'Wheat', 'Egg'), 'Store at room temperature in paper bag away from humidity.', 'room_temperature',
  '{{croissant-box.jpg}}', 'Toaster oven for 90 seconds at 160°C restores crisp layers.',
  'Consume within 24 hours of bake.',
  JSON_OBJECT(
    'business_permit', 'HCM-2024-1184', 'certificate_no', 'FS-2026-0552', 'issue_date', '2026-01-08',
    'inspected_by', 'Saigon Food Inspection Department', 'activity_start', '2021-08-15', 'ingredient_source', 'Imported French butter & bakery flour'
  ),
  JSON_ARRAY('Traditional 27-layer folding process', 'Zero margarine or palm oil', 'Fresh daily evening rescue batch'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 8 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), 'active'
),

-- Item 12: Tokyo Salmon Nigiri & Maki Box
(
  '44444444-4444-4444-8444-444444444463', '33333333-3333-4333-8333-333333333339',
  'Tokyo Evening Sushi Surprise Box', 'Assorted 8-piece sushi box including salmon nigiri, California roll, tuna maki, and pickled ginger.',
  '{{sushi-set.jpg}}', 110000, 59000, 3,
  JSON_ARRAY('Fish', 'Soy', 'Sesame'), 'Strictly keep cold. Do not expose to direct heat.', 'refrigerated',
  '{{sushi-set.jpg}}', 'Ready to eat cold. Do not heat.',
  'Keep below 5°C. Consume within 2 hours of collection.',
  JSON_OBJECT(
    'business_permit', 'HCM-2023-4411', 'certificate_no', 'FS-2026-0229', 'issue_date', '2026-01-12',
    'inspected_by', 'District 1 Health Authority', 'activity_start', '2022-06-20', 'ingredient_source', 'Certified seafood wholesale cold facility'
  ),
  JSON_ARRAY('Chef-prepared sushi set', 'Sealed with safety freshness sticker', 'Soy sauce and wasabi included'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 HOUR), 'active'
),

-- Item 13: Kyoto Uji Matcha Latte & Cookie
(
  '44444444-4444-4444-8444-444444444464', '33333333-3333-4333-8333-333333333340',
  'Iced Uji Matcha Latte + Choc Cookie', 'Stone-ground ceremonial Uji matcha with oat milk, paired with a soft baked dark chocolate chunk cookie.',
  '{{matcha-latte.jpg}}', 65000, 35000, 6,
  JSON_ARRAY('Milk', 'Wheat'), 'Keep beverage chilled with ice. Keep cookie dry.', 'room_temperature',
  '{{matcha-latte.jpg}}', 'Ready to sip. Cookie can be warmed 10 seconds.',
  'Consume drink within 3 hours.',
  JSON_OBJECT(
    'business_permit', 'HCM-2024-5588', 'certificate_no', 'FS-2026-0612', 'issue_date', '2026-02-05',
    'inspected_by', 'District 3 Health Division', 'activity_start', '2023-04-12', 'ingredient_source', 'Authentic Kyoto Uji organic matcha'
  ),
  JSON_ARRAY('Pure matcha with no added syrup', 'Oat milk plant-based option', 'Paper straw and eco cup'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 HOUR), 'active'
),

-- Item 14: Chef's Magic Surprise Mystery Bag
(
  '44444444-4444-4444-8444-444444444465', '33333333-3333-4333-8333-333333333336',
  'Chef''s Gourmet Mystery Rescue Bag', 'Surprise rescue bag containing 3–4 signature bakery, sandwich, and salad items worth over 180.000₫!',
  '{{category-bakery.jpg}}', 180000, 69000, 5,
  JSON_ARRAY('Wheat', 'Milk', 'Egg'), 'Check individual food stickers inside the bag for specific storage advice.', 'room_temperature',
  '{{category-bakery.jpg}}', 'Reheat baked goods for 1-2 minutes or enjoy fresh.',
  'Consume items by tonight or keep refrigerated.',
  JSON_OBJECT(
    'business_permit', 'HCM-2023-9912', 'certificate_no', 'FS-2026-0742', 'issue_date', '2026-02-10',
    'inspected_by', 'District 1 Health Authority', 'activity_start', '2022-04-01', 'ingredient_source', 'The Corner Kitchen daily premium menu'
  ),
  JSON_ARRAY('Guaranteed minimum 60% savings', 'Surplus items prepared today', 'Zero waste mission partner'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active'
),

-- Item 15: 0đ Community Free Meal (Sharing Station)
(
  '44444444-4444-4444-8444-444444444466', '33333333-3333-4333-8333-333333333337',
  '0đ Warm Vegetarian Rice & Tofu Box', 'Free community meal box with steamed jasmine rice, lemongrass braised tofu, and stir-fried greens.',
  '{{food-vegetable-rice.jpg}}', 0, 0, 10,
  JSON_ARRAY('Soy'), 'Ready to eat warm. Safe container.', 'room_temperature',
  '{{food-vegetable-rice.jpg}}', 'Reheat in microwave or eat warm directly from hot cabinet.',
  'Take 1 portion per person so everyone has a meal.',
  JSON_OBJECT(
    'business_permit', 'COMMUNITY-CHARITY-01', 'certificate_no', 'FS-COMMUNITY-2026', 'issue_date', '2026-01-01',
    'inspected_by', 'Da Nang Red Cross & Volunteer Alliance', 'activity_start', '2024-01-01', 'ingredient_source', 'Sponsored by local fresh produce vendors'
  ),
  JSON_ARRAY('100% Free for students, workers & people in need', 'Hygienically packed daily', 'Warm temperature storage box'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), 'active'
),

-- Item 16: 0đ Community Fresh Bread & Milk Set
(
  '44444444-4444-4444-8444-444444444467', '33333333-3333-4333-8333-333333333337',
  '0đ Fresh Bread & Soy Milk Bundle', 'Nutritious morning bread and warm unsweetened soy milk bottle for community breakfast rescue.',
  '{{category-sharing-corner.jpg}}', 0, 0, 12,
  JSON_ARRAY('Soy', 'Wheat'), 'Keep bread sealed in paper bag. Drink soy milk fresh.', 'room_temperature',
  '{{category-sharing-corner.jpg}}', 'Shake well before drinking.',
  'Available at Community Station 1 all morning.',
  JSON_OBJECT(
    'business_permit', 'COMMUNITY-CHARITY-01', 'certificate_no', 'FS-COMMUNITY-2026', 'issue_date', '2026-01-01',
    'inspected_by', 'Da Nang Red Cross & Volunteer Alliance', 'activity_start', '2024-01-01', 'ingredient_source', 'Donated by partner bakeries'
  ),
  JSON_ARRAY('Completely free of charge', 'Nutritious high-protein start', 'Respectful self-service pickup'),
  CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR), 'active'
)

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
  storage_type = VALUES(storage_type),
  label_image_url = VALUES(label_image_url),
  reheating_instructions = VALUES(reheating_instructions),
  refrigeration_requirement = VALUES(refrigeration_requirement),
  origin_info = VALUES(origin_info),
  seller_commitments = VALUES(seller_commitments),
  prepared_at = VALUES(prepared_at),
  expires_at = VALUES(expires_at),
  pickup_starts_at = VALUES(pickup_starts_at),
  pickup_ends_at = VALUES(pickup_ends_at),
  status = VALUES(status);

-- 4. WAITLIST DATA
INSERT INTO waitlists (id, food_item_id, user_id, queue_position, quantity, status)
VALUES
('55555555-5555-4555-8555-555555555551', '44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111112', 1, 1, 'waiting'),
('55555555-5555-4555-8555-555555555552', '44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111113', 2, 1, 'waiting'),
('55555555-5555-4555-8555-555555555553', '44444444-4444-4444-8444-444444444442', '11111111-1111-4111-8111-111111111114', 1, 1, 'waiting')
ON DUPLICATE KEY UPDATE
  queue_position = VALUES(queue_position),
  quantity = VALUES(quantity),
  status = VALUES(status);
