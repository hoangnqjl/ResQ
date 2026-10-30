CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(40) UNIQUE,
  role ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  is_incognito BOOLEAN NOT NULL DEFAULT FALSE,
  dietary_preferences JSON NOT NULL,
  allergies JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shops (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  safety_certificate_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  reputation_score DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shops_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  shop_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,2) NOT NULL,
  quantity_available INT NOT NULL DEFAULT 0,
  allergens JSON NOT NULL,
  storage_instructions TEXT,
  prepared_at DATETIME,
  expires_at DATETIME,
  pickup_starts_at DATETIME,
  pickup_ends_at DATETIME,
  status ENUM('active','reserved','sold_out','expired','cancelled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_food_items_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  CONSTRAINT chk_food_prices CHECK (original_price >= 0 AND current_price >= 0),
  CONSTRAINT chk_food_quantity CHECK (quantity_available >= 0),
  INDEX idx_food_items_status_pickup (status, pickup_ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  food_item_id CHAR(36) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  quantity INT NOT NULL,
  status ENUM('held','confirmed','picked_up','cancelled','expired') NOT NULL DEFAULT 'held',
  hold_expires_at DATETIME NOT NULL,
  pickup_slot_start DATETIME,
  pickup_slot_end DATETIME,
  deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_food FOREIGN KEY (food_item_id) REFERENCES food_items(id),
  CONSTRAINT fk_reservations_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT chk_reservation_quantity CHECK (quantity > 0),
  INDEX idx_reservations_buyer_status (buyer_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  user_id CHAR(36) NOT NULL,
  food_item_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, food_item_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_food FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  notification_radius_km DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  quiet_start TIME NOT NULL DEFAULT '22:00:00',
  quiet_end TIME NOT NULL DEFAULT '07:00:00',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  reservation_id CHAR(36) UNIQUE,
  buyer_id CHAR(36) NOT NULL,
  shop_id CHAR(36) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status ENUM('pending','paid','refunded','failed') NOT NULL DEFAULT 'pending',
  pickup_qr_token VARCHAR(64) NOT NULL UNIQUE,
  status ENUM('awaiting_pickup','ready','completed','cancelled','overdue') NOT NULL DEFAULT 'awaiting_pickup',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id),
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT fk_orders_shop FOREIGN KEY (shop_id) REFERENCES shops(id),
  CONSTRAINT chk_order_total CHECK (total_amount >= 0),
  INDEX idx_orders_shop_created (shop_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36),
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_type ENUM('payment','deposit','refund','voucher') NOT NULL,
  status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  provider_reference VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS drop_alerts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  shop_id CHAR(36),
  keyword VARCHAR(255),
  radius_km DECIMAL(5,2) NOT NULL DEFAULT 3,
  notify_free_food BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours JSON NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_drop_alerts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_drop_alerts_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS complaints (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  reporter_id CHAR(36) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls JSON NOT NULL,
  resolution TEXT,
  status ENUM('submitted','reviewing','resolved','rejected') NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaints_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_complaints_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
  INDEX idx_complaints_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  shop_id CHAR(36) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_reviews_author FOREIGN KEY (author_id) REFERENCES users(id),
  CONSTRAINT fk_reviews_shop FOREIGN KEY (shop_id) REFERENCES shops(id),
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_review_order_author (order_id, author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
