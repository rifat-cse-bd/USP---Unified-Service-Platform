# USP — Unified Service Platform (WorkSure)

Full-stack **service marketplace** that connects customers with verified workers. The app is branded **WorkSure** in the UI and API.

## Stack

| Part | Technology |
|------|------------|
| Backend | Node.js, Express 5, MySQL, Socket.io, JWT |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Payments | Stripe (optional), mock bKash/Nagad |
| Images | Static assets in `frontend/public/images/` |

## Service structure (6 majors + sub-features)

| Major sector | Sub-features (examples) |
|--------------|-------------------------|
| **Cleaning** | Deep cleaning, office cleaning, kitchen degreasing, upholstery, post-construction, garden |
| **Electrician** | Re-wiring, troubleshooting, fans/lights, AC wiring, smart home, IPS/generator |
| **Security** | Bodyguard, residential guard, store security, event guard, CCTV, biometric access, alarms |
| **Catering** | Wedding buffet, corporate lunch, birthday finger food, home chef, BBQ, festival feast |
| **Babysitting** | Daytime nanny, homework helper, weekend sitter, infant care, special needs, emergency care |
| **Pet Care** | Dog walking, pet sitting, grooming, overnight boarding, vet escort, puppy training, exotic care |

Catalog source of truth: [`database/service-catalog.json`](database/service-catalog.json)

---

## Connect phpMyAdmin / MySQL to this project

The backend does **not** use a single `.sql` file path in config — it connects with **host, user, password, and database name** (same values you use in phpMyAdmin).

### Option A — Import one SQL file in phpMyAdmin (recommended)

1. Start MariaDB on Arch: `sudo systemctl start mariadb`
2. Log in to phpMyAdmin as `root` / your password.
3. **Import** [`database/phpmyadmin_setup.sql`](database/phpmyadmin_setup.sql) (creates `worksure` + all tables + 6 majors + sub-features).
4. Set `backend/.env` (`DB_USER=root`, `DB_PASSWORD=...`, `DB_NAME=worksure`).
5. Optional demo users: `cd backend && npm run seed`

See **[database/PHPMYADMIN_SETUP.md](database/PHPMYADMIN_SETUP.md)** for Arch + KDE step-by-step.

### Option B — Let Node create everything

1. Open **phpMyAdmin** and confirm MySQL is running (e.g. XAMPP, WAMP, MariaDB).
2. Note your MySQL credentials (often user `root`, empty password on local XAMPP).
3. Create `backend/.env` from [`backend/.env.example`](backend/.env.example) and set:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=worksure
   ```

4. From the project root:

   ```bash
   cd backend
   npm install
   npm run seed
   ```

   This will:

   - Create database `worksure` if it does not exist
   - Run [`database/schema.sql`](database/schema.sql) (all tables)
   - Insert 6 majors, all sub-features, demo users, and 50 workers

5. In phpMyAdmin, refresh — you should see database **`worksure`** with tables like `users`, `categories`, `services`, `bookings`, etc.

### Option C — You already created an empty database in phpMyAdmin

1. In phpMyAdmin, create a database (e.g. `worksure`) with collation **utf8mb4_unicode_ci**.
2. Set `DB_NAME=worksure` (or your name) in `backend/.env`.
3. **Import schema:**
   - phpMyAdmin → your database → **Import** → choose [`database/schema.sql`](database/schema.sql) → Go.
4. **Seed data:**

   ```bash
   cd backend
   npm install
   npm run seed
   ```

   If `npm run seed` fails because tables already exist, drop all tables in phpMyAdmin (or drop/recreate the database), then run seed again.

### Option D — Existing database from an older version (9 flat categories)

Run the migration SQL in phpMyAdmin, then re-seed:

1. Import [`database/migrate_categories_hierarchy.sql`](database/migrate_categories_hierarchy.sql) on your `worksure` database.
2. Drop dependent data or recreate the database, then `npm run seed`.

### phpMyAdmin checklist

| Setting | Value |
|---------|--------|
| Host | `localhost` (or `127.0.0.1`) |
| Port | `3306` |
| Database name | Same as `DB_NAME` in `.env` |
| Charset | `utf8mb4` |

**Important:** phpMyAdmin and the Node backend must point at the **same** MySQL server and **same** database name. Changing data in phpMyAdmin is visible to the app immediately after refresh (no extra “link” step).

---

## Quick start (run the app)

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit DB_* and JWT_SECRET
npm install
npm run seed           # first time only
npm run dev            # http://localhost:5000
```

Health: [http://localhost:5000/health](http://localhost:5000/health)

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # optional
npm install
npm run dev            # http://localhost:5173
```

Vite proxies `/api` and `/uploads` to the backend (port 5000).

### Demo accounts (after seed)

Password: **`Password123!`**

| Role | Email |
|------|--------|
| Admin | `admin@worksure.com` |
| Customer | `customer@worksure.com` |
| Workers | `worker1@worksure.com` … `worker50@worksure.com` |

---

## Project layout

```
backend/          API + Socket.io
frontend/         React SPA
database/         schema.sql, service-catalog.json, migrations
frontend/public/images/   Sector & sub-feature photos (served at /images/...)
```

## Adding or changing services / images

1. Edit [`database/service-catalog.json`](database/service-catalog.json) (majors and sub-features).
2. Add matching `.jpg` files under `frontend/public/images/` (use the `image` filenames from the JSON).
3. Re-run `npm run seed` in `backend/` (or update rows in phpMyAdmin `categories` table).

## API overview

Base URL: `http://localhost:5000/api`

- `GET /services/categories` — `{ majors: [...], categories: [...] }`
- `GET /workers/public?category=<sub-or-major-slug>`
- Auth, bookings, payments, chat, admin — see `backend/src/routes/`

## License

MIT
