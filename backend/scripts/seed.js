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

const catalogPath = path.join(__dirname, '../../database/service-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const SUB_CATEGORY_SLUGS = catalog.majors.flatMap((m) => m.subfeatures.map((s) => s.slug));

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

  let sortOrder = 0;
  for (const major of catalog.majors) {
    const [majorRes] = await conn.query(
      `INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
       VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
      [major.name, major.slug, major.icon, major.description, `/images/${major.image}`, sortOrder++]
    );
    const majorId = majorRes.insertId;
    let subOrder = 0;
    for (const sub of major.subfeatures) {
      await conn.query(
        `INSERT INTO categories (parent_id, name, slug, icon, description, image_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [majorId, sub.name, sub.slug, major.icon, sub.description, `/images/${sub.image}`, subOrder++]
      );
    }
  }

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
    const catSlug = SUB_CATEGORY_SLUGS[(i - 1) % SUB_CATEGORY_SLUGS.length];
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

  await seedDemoData(conn);

  console.info(`Seed complete: ${WORKER_COUNT} workers across ${catalog.majors.length} majors and ${SUB_CATEGORY_SLUGS.length} sub-features.`);
  console.info('Demo bookings, payments, reviews, complaints, and documents included.');
  console.info('Logins (password Password123!):');
  console.info('  admin@worksure.com');
  console.info('  customer@worksure.com');
  console.info('  worker1@worksure.com … worker50@worksure.com');
  await conn.end();
}

async function seedDemoData(conn) {
  const [[customer]] = await conn.query(`SELECT id FROM users WHERE email = 'customer@worksure.com'`);
  const [[admin]] = await conn.query(`SELECT id FROM users WHERE email = 'admin@worksure.com'`);
  if (!customer) return;

  const [services] = await conn.query(
    `SELECT s.id AS service_id, s.worker_id, s.base_price, s.title FROM services s ORDER BY s.id LIMIT 32`
  );
  if (!services.length) return;

  const statuses = [
    ...Array(6).fill('pending'),
    ...Array(5).fill('accepted'),
    ...Array(5).fill('in_progress'),
    ...Array(12).fill('completed'),
    ...Array(2).fill('cancelled'),
    ...Array(2).fill('rejected'),
  ];
  const providers = ['bkash', 'nagad', 'mock_card', 'stripe'];
  const completedBookings = [];

  for (let i = 0; i < Math.min(services.length, statuses.length); i++) {
    const svc = services[i];
    const status = statuses[i];
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + (i - 10));
    scheduled.setHours(9 + (i % 8), 0, 0, 0);

    const [bRes] = await conn.query(
      `INSERT INTO bookings (customer_id, worker_id, service_id, status, scheduled_at, address, notes, total_price, tracking_note)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        customer.id,
        svc.worker_id,
        svc.service_id,
        status,
        scheduled,
        `${pick(CITIES, i)}, Road ${(i % 20) + 1} — demo address`,
        `WorkSure demo booking #${i + 1}. Customer requested standard scope.`,
        Number(svc.base_price),
        status === 'in_progress' ? 'Worker en route — demo tracking' : null,
      ]
    );
    const bookingId = bRes.insertId;

    await conn.query(
      `INSERT INTO booking_status_history (booking_id, status, changed_by, note) VALUES (?,?,?,?)`,
      [bookingId, 'pending', customer.id, 'Booking created']
    );
    if (status !== 'pending') {
      await conn.query(
        `INSERT INTO booking_status_history (booking_id, status, changed_by, note) VALUES (?,?,?,?)`,
        [bookingId, status, admin?.id || customer.id, `Updated to ${status} (seed)`]
      );
    }

    if (status === 'completed') {
      completedBookings.push({ id: bookingId, worker_id: svc.worker_id, price: Number(svc.base_price), i });
    } else if (status === 'in_progress' || status === 'accepted') {
      const amount = Number(svc.base_price);
      const commission = Math.round(amount * 0.2 * 100) / 100;
      const workerPayout = Math.round((amount - commission) * 100) / 100;
      await conn.query(
        `INSERT INTO payments (booking_id, payer_id, amount, platform_commission, worker_payout, provider, status, transaction_ref, invoice_number)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          bookingId,
          customer.id,
          amount,
          commission,
          workerPayout,
          providers[i % providers.length],
          'pending',
          null,
          `WS-PEND-${bookingId}`,
        ]
      );
    }
  }

  const reviewComments = [
    'Very professional and on time. Would book again.',
    'Great communication throughout the job. Highly recommended.',
    'Exceeded expectations — thorough and polite.',
    'Good value for money. Minor delay but quality was excellent.',
    'Outstanding work. The platform made payment easy.',
  ];

  for (const b of completedBookings) {
    const amount = b.price;
    const commission = Math.round(amount * 0.2 * 100) / 100;
    const workerPayout = Math.round((amount - commission) * 100) / 100;
    const provider = providers[b.i % providers.length];
    await conn.query(
      `INSERT INTO payments (booking_id, payer_id, amount, platform_commission, worker_payout, provider, status, transaction_ref, invoice_number)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        b.id,
        customer.id,
        amount,
        commission,
        workerPayout,
        provider,
        'completed',
        `TXN-DEMO-${b.id}`,
        `WS-INV-${String(b.id).padStart(5, '0')}`,
      ]
    );
    await conn.query(
      `INSERT INTO reviews (booking_id, reviewer_id, worker_id, rating, comment) VALUES (?,?,?,?,?)`,
      [
        b.id,
        customer.id,
        b.worker_id,
        4 + (b.i % 2),
        reviewComments[b.i % reviewComments.length],
      ]
    );
  }

  const [[worker1]] = await conn.query(`SELECT id FROM workers ORDER BY id LIMIT 1`);
  const complaints = [
    { subject: 'Late arrival for scheduled cleaning', message: 'Worker arrived 45 minutes late without prior notice.', status: 'open' },
    { subject: 'Payment not reflected in dashboard', message: 'Completed bKash payment but booking still shows pending payment.', status: 'reviewing' },
    { subject: 'Service scope mismatch', message: 'Electrician task did not include materials as described in listing.', status: 'open' },
    { subject: 'Rude communication', message: 'Unprofessional messages during catering event setup.', status: 'resolved', note: 'Spoke with worker — warning issued.' },
    { subject: 'Refund request — cancelled booking', message: 'Booking cancelled by worker; customer requests refund within 48h.', status: 'reviewing' },
    { subject: 'Duplicate charge', message: 'Customer charged twice for the same security shift.', status: 'resolved', note: 'Duplicate payment reversed in demo ledger.' },
    { subject: 'Profile information inaccurate', message: 'Worker profile years of experience does not match intake form.', status: 'dismissed', note: 'No policy violation found after review.' },
    { subject: 'Pet sitter no-show', message: 'At-home pet sitting booking — sitter did not arrive.', status: 'open' },
  ];

  for (const c of complaints) {
    await conn.query(
      `INSERT INTO complaints (reporter_id, subject_user_id, booking_id, subject, message, status, resolution_note)
       VALUES (?,?,?,?,?,?,?)`,
      [
        customer.id,
        null,
        null,
        c.subject,
        c.message,
        c.status,
        c.note || null,
      ]
    );
  }

  const [workers] = await conn.query(`SELECT id FROM workers ORDER BY id LIMIT 12`);
  for (let i = 0; i < workers.length; i++) {
    const wid = workers[i].id;
    const docStatus = i < 5 ? 'pending' : i < 9 ? 'approved' : 'rejected';
    await conn.query(
      `INSERT INTO worker_documents (worker_id, doc_type, file_url, status, admin_note, reviewed_by, reviewed_at)
       VALUES (?,?,?,?,?,?,?)`,
      [
        wid,
        i % 2 === 0 ? 'nid' : 'certificate',
        `https://placehold.co/600x400?text=Doc-${wid}`,
        docStatus,
        docStatus === 'pending' ? null : 'Reviewed during seed',
        docStatus === 'pending' ? null : admin?.id || null,
        docStatus === 'pending' ? null : new Date(),
      ]
    );
    if (docStatus === 'approved') {
      await conn.query(`UPDATE workers SET is_verified = 1, verified_at = NOW() WHERE id = ?`, [wid]);
    }
  }

  console.info(`  Demo: ${Math.min(services.length, statuses.length)} bookings, ${completedBookings.length} completed w/ payments & reviews, ${complaints.length} complaints`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
