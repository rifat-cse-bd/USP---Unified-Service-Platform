import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIRST = [
  'Fatima', 'Karim', 'Nadia', 'Rafiq', 'Sadia', 'Tania', 'Omar', 'Hasan', 'Jamal', 'Ayesha',
  'Imran', 'Samira', 'Rahim', 'Priya', 'Arif', 'Laila', 'Mizan', 'Sumaiya', 'Tanvir', 'Nusrat',
  'Farhan', 'Mehdi', 'Zara', 'Bashir', 'Hira', 'Saiful', 'Anika', 'Rubel', 'Maya', 'Shuvo',
];
const LAST = [
  'Rahman', 'Hossain', 'Khan', 'Ahmed', 'Islam', 'Chowdhury', 'Begum', 'Ali', 'Akter', 'Uddin',
  'Miah', 'Sarkar', 'Das', 'Khatun', 'Malik', 'Haque', 'Karim', 'Sultana', 'Parvin', 'Jahan',
];
const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur', 'Narayanganj'];
const CATEGORY_SLUGS = [
  'cleaning', 'electrician', 'plumbing', 'security', 'catering', 'babysitting', 'pet-care', 'ac-repair', 'home-maintenance',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || 'worksure';
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await conn.query(schema);

  await conn.query(
    `INSERT INTO categories (name, slug, icon, description) VALUES
    ('Cleaning','cleaning','Sparkles','Home and office cleaning'),
    ('Electrician','electrician','Zap','Wiring and electrical repairs'),
    ('Plumbing','plumbing','Droplets','Pipes, leaks, and fixtures'),
    ('Security','security','Shield','Guards and patrol'),
    ('Catering','catering','UtensilsCrossed','Events and daily meals'),
    ('Babysitting','babysitting','Baby','Child care at home'),
    ('Pet Care','pet-care','PawPrint','Walking, sitting, and grooming'),
    ('AC Repair','ac-repair','Wind','AC installation and servicing'),
    ('Home Maintenance','home-maintenance','Wrench','General repairs and upkeep')`
  );

  const password = await bcrypt.hash('Password123!', 12);

  await conn.query(`INSERT INTO users (email, password_hash, role, full_name, phone, city) VALUES (?,?,?,?,?,?)`, [
    'admin@worksure.com', password, 'admin', 'WorkSure Admin', '01700000001', 'Dhaka',
  ]);
  await conn.query(`INSERT INTO users (email, password_hash, role, full_name, phone, city, address) VALUES (?,?,?,?,?,?,?)`, [
    'customer@worksure.com', password, 'customer', 'Rahim Customer', '01700000002', 'Dhaka', 'Dhanmondi',
  ]);

  const [catRows] = await conn.query(`SELECT id, slug, name FROM categories`);
  const slugToId = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));
  const slugToName = Object.fromEntries(catRows.map((c) => [c.slug, c.name]));

  const WORKER_COUNT = 50;

  for (let i = 1; i <= WORKER_COUNT; i++) {
    const catSlug = CATEGORY_SLUGS[(i - 1) % CATEGORY_SLUGS.length];
    const catName = slugToName[catSlug];
    const fullName = `${pick(FIRST, i)} ${pick(LAST, i * 3)}`;
    const email = `worker${i}@worksure.com`;
    const city = pick(CITIES, i);
    const hourlyRate = 350 + (i % 12) * 75;
    const rating = (4.2 + (i % 8) * 0.1).toFixed(1);
    const ratingCount = 5 + (i % 40);

    const [uRes] = await conn.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, city, address) VALUES (?,?,?,?,?,?,?)`,
      [email, password, 'worker', fullName, `017${String(10000000 + i).slice(-8)}`, city, `${city} area`]
    );
    const uid = uRes.insertId;

    const [wRes] = await conn.query(
      `INSERT INTO workers (user_id, headline, bio, hourly_rate, rating_avg, rating_count, is_verified, years_experience, availability)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        uid,
        `${catName} specialist — ${fullName.split(' ')[0]}`,
        `Professional ${catName.toLowerCase()} provider on WorkSure. ${3 + (i % 10)} years experience. Available across ${city}.`,
        hourlyRate,
        rating,
        ratingCount,
        i % 5 !== 0 ? 1 : 0,
        2 + (i % 12),
        JSON.stringify({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: i % 2 === 0 }),
      ]
    );
    const wid = wRes.insertId;
    const cid = slugToId[catSlug];
    const svcSlug = `svc-${catSlug}-${wid}-${randomBytes(3).toString('hex')}`.slice(0, 280);

    await conn.query(
      `INSERT INTO services (worker_id, category_id, title, slug, description, base_price, duration_minutes, is_active, tags)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        wid,
        cid,
        `${catName} — standard visit`,
        svcSlug,
        `On-demand ${catName.toLowerCase()} visit. Materials included where applicable.`,
        hourlyRate * 2,
        90 + (i % 4) * 30,
        1,
        `${catSlug},verified,popular`,
      ]
    );
  }

  console.info(`Seed complete: ${WORKER_COUNT} workers across ${CATEGORY_SLUGS.length} service sectors.`);
  console.info('Logins (password Password123!):');
  console.info('  admin@worksure.com');
  console.info('  customer@worksure.com');
  console.info('  worker1@worksure.com … worker50@worksure.com');
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
