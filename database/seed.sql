-- WorkSure seed data (reference; full demo data via: cd backend && npm run seed)
SET NAMES utf8mb4;

INSERT INTO categories (name, slug, icon, description) VALUES
('Cleaning', 'cleaning', 'Sparkles', 'Home and office cleaning'),
('Electrician', 'electrician', 'Zap', 'Wiring and electrical repairs'),
('Plumbing', 'plumbing', 'Droplets', 'Pipes, leaks, and fixtures'),
('Security', 'security', 'Shield', 'Guards and patrol services'),
('Catering', 'catering', 'UtensilsCrossed', 'Events and daily meals'),
('Babysitting', 'babysitting', 'Baby', 'Child care at home'),
('Pet Care', 'pet-care', 'PawPrint', 'Walking, sitting, and grooming'),
('AC Repair', 'ac-repair', 'Wind', 'AC installation and servicing'),
('Home Maintenance', 'home-maintenance', 'Wrench', 'General repairs and upkeep')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
