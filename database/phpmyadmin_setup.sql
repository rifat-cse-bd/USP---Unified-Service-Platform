-- WorkSure — full phpMyAdmin setup (Arch Linux / MariaDB / MySQL)
-- Import this file: phpMyAdmin → Import → choose this file → Go
-- Database name: worksure
-- After import: set backend/.env (DB_USER=root, DB_PASSWORD=your password)
-- Demo users (optional): cd backend && npm run seed

CREATE DATABASE IF NOT EXISTS `worksure` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `worksure`;

-- WorkSure MySQL Schema
-- Charset: utf8mb4 for full Unicode support

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS worker_documents;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS workers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','customer','worker') NOT NULL DEFAULT 'customer',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NULL,
  avatar_url VARCHAR(512) NULL,
  address TEXT NULL,
  city VARCHAR(128) NULL,
  country VARCHAR(128) NULL DEFAULT 'Bangladesh',
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_banned TINYINT(1) NOT NULL DEFAULT 0,
  suspended_until DATETIME NULL,
  reset_password_token VARCHAR(255) NULL,
  reset_password_expires DATETIME NULL,
  fcm_token VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_city (city),
  KEY idx_users_banned (is_banned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  icon VARCHAR(64) NULL,
  description VARCHAR(512) NULL,
  image_url VARCHAR(512) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE workers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  headline VARCHAR(255) NULL,
  bio TEXT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  availability JSON NULL,
  service_radius_km INT UNSIGNED NOT NULL DEFAULT 15,
  years_experience TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_workers_user (user_id),
  KEY idx_workers_verified (is_verified),
  KEY idx_workers_rating (rating_avg),
  CONSTRAINT fk_workers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  worker_id BIGINT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 60,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  images JSON NULL,
  tags VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_slug (slug),
  KEY idx_services_worker (worker_id),
  KEY idx_services_category (category_id),
  KEY idx_services_price (base_price),
  KEY idx_services_active (is_active),
  FULLTEXT KEY ft_services_search (title, description, tags),
  CONSTRAINT fk_services_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  worker_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','accepted','rejected','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  scheduled_at DATETIME NOT NULL,
  address TEXT NOT NULL,
  notes TEXT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  tracking_note VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_customer (customer_id),
  KEY idx_bookings_worker (worker_id),
  KEY idx_bookings_service (service_id),
  KEY idx_bookings_status (status),
  KEY idx_bookings_scheduled (scheduled_at),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(32) NOT NULL,
  changed_by BIGINT UNSIGNED NULL,
  note VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_history (booking_id, created_at),
  CONSTRAINT fk_booking_history_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  payer_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL DEFAULT 0,
  worker_payout DECIMAL(10,2) NOT NULL DEFAULT 0,
  provider ENUM('bkash','nagad','mock_card','stripe') NOT NULL DEFAULT 'bkash',
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(255) NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  invoice_number VARCHAR(64) NULL,
  meta JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_booking (booking_id),
  KEY idx_payments_payer (payer_id),
  KEY idx_payments_status (status),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_payer FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  reviewer_id BIGINT UNSIGNED NOT NULL,
  worker_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_booking (booking_id),
  KEY idx_reviews_worker (worker_id),
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NULL,
  data JSON NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_user (user_id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  scheduled_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_service (cart_id, service_id),
  KEY idx_cart_items_service (service_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wishlist (
  user_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, service_id),
  KEY idx_wishlist_service (service_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE worker_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  worker_id BIGINT UNSIGNED NOT NULL,
  doc_type ENUM('nid','passport','license','certificate','other') NOT NULL DEFAULT 'nid',
  file_url VARCHAR(512) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note VARCHAR(512) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_worker_docs_worker (worker_id, status),
  CONSTRAINT fk_worker_docs_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  CONSTRAINT fk_worker_docs_admin FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(128) NOT NULL,
  target_type VARCHAR(64) NULL,
  target_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_logs_admin (admin_id),
  CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE complaints (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reporter_id BIGINT UNSIGNED NOT NULL,
  subject_user_id BIGINT UNSIGNED NULL,
  booking_id BIGINT UNSIGNED NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
  resolution_note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_complaints_status (status),
  CONSTRAINT fk_complaints_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_complaints_subject_user FOREIGN KEY (subject_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_booking (booking_id, created_at),
  CONSTRAINT fk_messages_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------------
-- Service categories (6 majors + sub-features)
-- ---------------------------------------------------------------------------

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES
(NULL, 'Cleaning', 'cleaning', 'Sparkles', 'Home, office, and specialty cleaning services.', '/images/cleaning.jpg', 0);

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Full Home Deep Cleaning', 'full-home-deep-cleaning', 'Sparkles', 'Whole-home deep clean including floors, surfaces, and bathrooms.', '/images/full_home_deep_cleaning.jpg', 0
FROM categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Office Workspace Cleaning', 'office-workspace-cleaning', 'Sparkles', 'Desks, common areas, and meeting rooms for teams.', '/images/office_workspace_cleaning.jpg', 1
FROM categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Kitchen Deep Degreasing', 'kitchen-deep-degreasing', 'Sparkles', 'Appliances, hoods, and heavy grease removal.', '/images/kitchen_deep_degreasing.jpg', 2
FROM categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Sofa & Upholstery Shampooing', 'sofa-upholstery-shampooing', 'Sparkles', 'Fabric and upholstery refresh for living spaces.', '/images/sofa_upholstery_shampooing.jpg', 3
FROM categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Post-Construction Cleaning', 'post-construction-cleaning', 'Sparkles', 'Dust, debris, and finish-ready cleanup after builds.', '/images/post_construction_cleaning.jpg', 4
FROM categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Backyard & Garden Cleaning', 'backyard-and-garden-cleaning', 'Sparkles', 'Outdoor areas, patios, and garden tidy-up.', '/images/backyard_and_garden_cleaning.jpg', 5
FROM categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES
(NULL, 'Electrician', 'electrician', 'Zap', 'Licensed electrical repairs, installs, and safety checks.', '/images/electrician.jpg', 1);

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Complete House Re-Wiring', 'complete-house-re-wiring', 'Zap', 'Full or partial home rewiring by certified electricians.', '/images/complete_house_re_wiring.jpg', 0
FROM categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Short Circuit Troubleshooting', 'short-circuit-troubleshooting', 'Zap', 'Diagnose tripped breakers, faults, and unsafe wiring.', '/images/short_circuit_troubleshooting.jpg', 1
FROM categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Ceiling Fan & Light Installation', 'ceiling-fan-and-light-installation', 'Zap', 'Mount fans, fixtures, and lighting upgrades.', '/images/ceiling_fan_and_light_installation.jpg', 2
FROM categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'AC Electrical Wiring', 'air-conditioner-electrical-wiring', 'Zap', 'Dedicated lines and safe hookups for AC units.', '/images/air_conditioner_electrical_wiring.jpg', 3
FROM categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Smart Home Device Setup', 'smart-home-device-setup', 'Zap', 'Smart switches, hubs, and automation wiring.', '/images/smart_home_device_setup.jpg', 4
FROM categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'IPS & Generator Maintenance', 'ips-and-generator-maintenance', 'Zap', 'Backup power systems — install, test, and service.', '/images/ips_and_generator_maintenance.jpg', 5
FROM categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES
(NULL, 'Security', 'security', 'Shield', 'Guards, patrol, and surveillance for homes and businesses.', '/images/security.jpg', 2);

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Personal Bodyguard Protection', 'personal-bodyguard-protection', 'Shield', 'Close protection for executives and VIP events.', '/images/personal_bodyguard_protection.jpg', 0
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Night Shift Residential Guard', 'night-shift-residential-guard', 'Shield', 'Overnight residential security coverage.', '/images/night_shift_residential_guard.jpg', 1
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Commercial Store Security', 'commercial-store-security', 'Shield', 'Retail and storefront guard services.', '/images/commercial_store_security.jpg', 2
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Private Event Security Guard', 'private-event-security-guard', 'Shield', 'Crowd and perimeter control for private events.', '/images/private_event_security_guard.jpg', 3
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'CCTV Camera System Installation', 'cctv-camera-system-installation', 'Shield', 'Camera placement, cabling, and DVR/NVR setup.', '/images/cctv_camera_system_installation.jpg', 4
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Biometric Access Control Setup', 'biometric-access-control-setup', 'Shield', 'Fingerprint and card access for secure entry.', '/images/biometric_access_control_setup.jpg', 5
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Smart Alarm Infrastructure', 'smart-alarm-infrastructure', 'Shield', 'Alarm panels, sensors, and monitoring integration.', '/images/smart_alarm_infrastructure.jpg', 6
FROM categories WHERE slug = 'security' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES
(NULL, 'Catering', 'catering', 'UtensilsCrossed', 'Event meals, corporate catering, and private chefs.', '/images/catering.jpg', 3);

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Wedding Buffet Catering', 'wedding-buffet-catering', 'UtensilsCrossed', 'Full buffet menus for weddings and receptions.', '/images/wedding_buffet_catering.jpg', 0
FROM categories WHERE slug = 'catering' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Corporate Lunch Catering', 'corporate-lunch-catering', 'UtensilsCrossed', 'Office lunches and recurring team meal plans.', '/images/corporate_lunch_catering.jpg', 1
FROM categories WHERE slug = 'catering' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Birthday Party Finger Food', 'birthday-party-finger-food', 'UtensilsCrossed', 'Bite-sized menus for birthdays and celebrations.', '/images/birthday_party_finger_food.jpg', 2
FROM categories WHERE slug = 'catering' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Private Home Chef Experience', 'private-home-chef-experience', 'UtensilsCrossed', 'In-home chef for intimate dining experiences.', '/images/private_home_chef_experience.jpg', 3
FROM categories WHERE slug = 'catering' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Barbecue Grill Special', 'barbecue-grill-special', 'UtensilsCrossed', 'Outdoor BBQ and grill catering packages.', '/images/barbecue_grill_special.jpg', 4
FROM categories WHERE slug = 'catering' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Religious Festival Feast', 'religious-festival-feast', 'UtensilsCrossed', 'Large-format feasts for religious gatherings.', '/images/religious_festival_feast.jpg', 5
FROM categories WHERE slug = 'catering' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES
(NULL, 'Babysitting', 'babysitting', 'Baby', 'Trusted childcare at home — daytime, evening, and emergency.', '/images/babysitting.jpg', 4);

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Full-Time Daytime Nanny', 'full-time-daytime-nanny', 'Baby', 'Regular weekday nanny care for young children.', '/images/full_time_daytime_nanny.jpg', 0
FROM categories WHERE slug = 'babysitting' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'After-School Homework Helper', 'after-school-homework-helper', 'Baby', 'Pickup, supervision, and homework support.', '/images/after_school_homework_helper.jpg', 1
FROM categories WHERE slug = 'babysitting' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Weekend Night Babysitter', 'weekend-night-babysitter', 'Baby', 'Evening and weekend date-night sitting.', '/images/weekend_night_babysitter.jpg', 2
FROM categories WHERE slug = 'babysitting' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Infant Care Specialist', 'infant-care-specialist', 'Baby', 'Newborn and infant-focused care providers.', '/images/infant_care_specialist.jpg', 3
FROM categories WHERE slug = 'babysitting' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Special Needs Child Care', 'special-needs-child-care', 'Baby', 'Experienced carers for children with special needs.', '/images/special_needs_child_care.jpg', 4
FROM categories WHERE slug = 'babysitting' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Emergency On-Call Care', 'emergency-on-call-care', 'Baby', 'Short-notice childcare when plans change.', '/images/emergency_on_call_care.jpg', 5
FROM categories WHERE slug = 'babysitting' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES
(NULL, 'Pet Care', 'pet-care', 'PawPrint', 'Walking, sitting, grooming, and vet support for pets.', '/images/pet_caring.jpg', 5);

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Dog Walking & Exercise', 'dog-walking-and-exercise', 'PawPrint', 'Daily walks and active play sessions.', '/images/dog_walking_and_exercise.jpg', 0
FROM categories WHERE slug = 'pet-care' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'At-Home Pet Sitting', 'at-home-pet-sitting', 'PawPrint', 'In-home companionship while you are away.', '/images/at_home_pet_sitting.jpg', 1
FROM categories WHERE slug = 'pet-care' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Basic Pet Grooming & Bathing', 'basic-pet-grooming-and-bathing', 'PawPrint', 'Wash, brush, and basic coat maintenance.', '/images/basic_pet_grooming_and_bathing.jpg', 2
FROM categories WHERE slug = 'pet-care' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Overnight Pet Boarding', 'overnight-pet-boarding', 'PawPrint', 'Overnight stays in a carer''s home or facility.', '/images/overnight_pet_boarding.jpg', 3
FROM categories WHERE slug = 'pet-care' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Pet Vet Appointment Escort', 'pet-vet-appointment-escort', 'PawPrint', 'Transport and assistance at vet visits.', '/images/pet_vet_appointment_escort.jpg', 4
FROM categories WHERE slug = 'pet-care' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Puppy Training Companion', 'puppy-training-companion', 'PawPrint', 'Basic training support and socialization walks.', '/images/puppy_training_companion.jpg', 5
FROM categories WHERE slug = 'pet-care' LIMIT 1;

INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
SELECT id, 'Aquarium & Exotic Care', 'aquarium-and-exotic-care', 'PawPrint', 'Specialist care for fish, birds, and exotic pets.', '/images/aquarium_and_exotic_care.jpg', 6
FROM categories WHERE slug = 'pet-care' LIMIT 1;

-- Done. You should see 44 rows in `categories` (6 majors + 38 sub-features).
