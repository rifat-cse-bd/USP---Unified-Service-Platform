import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksure',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
  namedPlaceholders: true,
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  if (Array.isArray(rows)) return rows;
  return [];
}

/** For INSERT/UPDATE/DELETE — returns ResultSetHeader with insertId, affectedRows */
export async function run(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export { pool };
