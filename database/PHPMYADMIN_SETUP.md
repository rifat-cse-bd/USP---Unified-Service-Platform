# phpMyAdmin setup (Arch Linux + KDE)

Use this when you deleted the database and want a **clean** `worksure` database again.

## Your MySQL login (from you)

| Field | Value |
|--------|--------|
| User | `root` |
| Password | `shakib` |
| Host | `localhost` |
| Port | `3306` |
| Database name | `worksure` |

---

## Step 1 — Start MySQL (Arch)

In a terminal:

```bash
sudo systemctl start mariadb
# or, if you use Oracle MySQL instead:
# sudo systemctl start mysqld

sudo systemctl enable mariadb
```

Check it is running:

```bash
systemctl status mariadb
```

---

## Step 2 — Import the SQL file in phpMyAdmin

1. Open phpMyAdmin in the browser (often `http://localhost/phpmyadmin` or your Apache URL).
2. Log in as **root** / **shakib**.
3. Click **Import** in the top menu (you can import without selecting a database first).
4. **Choose file:**  
   `USP---Unified-Service-Platform/database/phpmyadmin_setup.sql`
5. Format: **SQL**
6. Click **Go** at the bottom.

This will:

- Create database **`worksure`**
- Create all tables (users, categories, bookings, payments, …)
- Insert **6 major** service sectors and **38 sub-features** (44 category rows total)

If import succeeds, click **`worksure`** in the left sidebar — you should see all tables.

---

## Step 3 — Connect the Node backend

Create `backend/.env` (copy from example):

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=shakib
DB_NAME=worksure

JWT_SECRET=pick-any-long-random-string-here
FRONTEND_URL=http://localhost:5173
PORT=5000
```

**Do not commit `.env`** — it contains your password.

---

## Step 4 — Demo users and workers (optional)

The SQL file only creates **structure + categories**. For login accounts and 50 demo workers:

```bash
cd backend
npm install
npm run seed
```

> **Note:** `npm run seed` drops and recreates tables from `schema.sql`, then inserts categories again plus users/workers.  
> If you only imported via phpMyAdmin and want to keep that import, skip seed and register via the app UI instead.

**After seed**, log in with password `Password123!`:

| Role | Email |
|------|--------|
| Admin | `admin@worksure.com` |
| Customer | `customer@worksure.com` |
| Worker | `worker1@worksure.com` |

---

## Step 5 — Run the app

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

## Troubleshooting (Arch)

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on port 3306 | Start MariaDB: `sudo systemctl start mariadb` |
| Access denied for user `root` | Reset password or use the same password in `.env` as in phpMyAdmin |
| Import file too large | In phpMyAdmin, increase upload limit in `php.ini` or import via CLI: `mysql -u root -p < database/phpmyadmin_setup.sql` |
| phpMyAdmin cannot connect | Check `config.inc.php` — host should be `localhost` |

### Import from terminal (alternative to phpMyAdmin UI)

```bash
mysql -u root -p < /srv/http/USP---Unified-Service-Platform/database/phpmyadmin_setup.sql
# Enter password: shakib
```

---

## Files to use

| File | Purpose |
|------|---------|
| **`phpmyadmin_setup.sql`** | **Import this in phpMyAdmin** (database + tables + categories) |
| `schema.sql` | Tables only (used by seed script) |
| `service-catalog.json` | Category definitions (used to generate SQL) |

To regenerate `phpmyadmin_setup.sql` after editing the catalog:

```bash
node database/generate-phpmyadmin-setup.js
```
