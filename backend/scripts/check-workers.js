import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksure',
});

const [w] = await conn.query('SELECT COUNT(*) AS c FROM workers');
const [u] = await conn.query("SELECT COUNT(*) AS c FROM users WHERE role='worker'");
const [byCat] = await conn.query(`
  SELECT c.name, COUNT(DISTINCT w.id) AS workers
  FROM categories c
  LEFT JOIN services s ON s.category_id = c.id
  LEFT JOIN workers w ON w.id = s.worker_id
  GROUP BY c.id, c.name ORDER BY c.name
`);

console.log('Workers table:', w[0].c);
console.log('Users (worker role):', u[0].c);
console.log('Per sector:');
byCat.forEach((r) => console.log(`  ${r.name}: ${r.workers}`));

await conn.end();
