/**
 * Generates database/phpmyadmin_setup.sql from schema + service-catalog.json
 * Run: node database/generate-phpmyadmin-setup.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'service-catalog.json'), 'utf8'));

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "''");
}

const categoryBlocks = [];
let sortOrder = 0;
for (const major of catalog.majors) {
  categoryBlocks.push(
    `INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order) VALUES\n` +
      `(NULL, '${esc(major.name)}', '${esc(major.slug)}', '${esc(major.icon)}', '${esc(major.description)}', '/images/${esc(major.image)}', ${sortOrder++});`
  );
  let subOrder = 0;
  for (const sub of major.subfeatures) {
    categoryBlocks.push(
      `INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)\n` +
        `SELECT id, '${esc(sub.name)}', '${esc(sub.slug)}', '${esc(major.icon)}', '${esc(sub.description)}', '/images/${esc(sub.image)}', ${subOrder++}\n` +
        `FROM categories WHERE slug = '${esc(major.slug)}' LIMIT 1;`
    );
  }
}

const sql = `-- WorkSure — full phpMyAdmin setup (Arch Linux / MariaDB / MySQL)
-- Import this file: phpMyAdmin → Import → choose this file → Go
-- Database name: worksure
-- After import: set backend/.env (DB_USER=root, DB_PASSWORD=your password)
-- Demo users (optional): cd backend && npm run seed

CREATE DATABASE IF NOT EXISTS \`worksure\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`worksure\`;

${schema}

-- ---------------------------------------------------------------------------
-- Service categories (6 majors + sub-features)
-- ---------------------------------------------------------------------------

${categoryBlocks.join('\n\n')}

-- Done. You should see 44 rows in \`categories\` (6 majors + 38 sub-features).
`;

const out = path.join(__dirname, 'phpmyadmin_setup.sql');
fs.writeFileSync(out, sql);
console.info(`Wrote ${out} (${(sql.length / 1024).toFixed(1)} KB)`);
