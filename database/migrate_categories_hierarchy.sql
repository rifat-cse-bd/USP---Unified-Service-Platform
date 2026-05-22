-- Run in phpMyAdmin (or mysql CLI) on an existing worksure database
-- Adds parent/child categories and images. Re-seed categories with: cd backend && npm run seed

SET NAMES utf8mb4;

ALTER TABLE categories
  ADD COLUMN parent_id INT UNSIGNED NULL AFTER id,
  ADD COLUMN image_url VARCHAR(512) NULL AFTER description,
  ADD COLUMN sort_order INT UNSIGNED NOT NULL DEFAULT 0 AFTER image_url,
  ADD KEY idx_categories_parent (parent_id),
  ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Remove legacy sectors (plumbing, ac-repair, home-maintenance) if present
DELETE FROM services WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('plumbing', 'ac-repair', 'home-maintenance'));
DELETE FROM categories WHERE slug IN ('plumbing', 'ac-repair', 'home-maintenance');
