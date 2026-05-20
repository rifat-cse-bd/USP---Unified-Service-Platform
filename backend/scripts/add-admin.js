import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const ADMIN_EMAIL = 'admin@worksure.com';
const ADMIN_PASSWORD = 'Admin@WorkSure2026';
const ADMIN_NAME = 'WorkSure Admin';

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worksure',
  });

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const [existing] = await conn.query(`SELECT id FROM users WHERE email = ?`, [ADMIN_EMAIL]);

  if (existing.length) {
    await conn.query(
      `UPDATE users SET password_hash = ?, role = 'admin', full_name = ?, is_active = 1, is_banned = 0, suspended_until = NULL WHERE email = ?`,
      [password_hash, ADMIN_NAME, ADMIN_EMAIL]
    );
    console.info('Admin account updated.');
  } else {
    await conn.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, city) VALUES (?, ?, 'admin', ?, ?, ?)`,
      [ADMIN_EMAIL, password_hash, ADMIN_NAME, '01700000001', 'Dhaka']
    );
    console.info('Admin account created.');
  }

  console.info('');
  console.info('Login credentials:');
  console.info(`  Email:    ${ADMIN_EMAIL}`);
  console.info(`  Password: ${ADMIN_PASSWORD}`);
  console.info('');
  console.info('Sign in at http://localhost:5173/login then open /admin/dashboard');

  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
