# E.F.A.S. — Electronic Feedback and Accountability System
### Solano, Nueva Vizcaya 🚖

---

## 📁 Project Structure

```
efas/
├── database/
│   └── efas_schema.sql       ← I-import sa Navicat
├── backend/
│   ├── config/
│   │   └── db.js             ← MySQL connection
│   ├── middleware/
│   │   └── auth.js           ← JWT authentication
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── driverController.js
│   │   └── complaintController.js
│   ├── routes/
│   │   └── index.js          ← Lahat ng API routes
│   ├── server.js             ← Entry point
│   ├── package.json
│   └── .env.example          ← Kopyahin bilang .env
└── frontend/                 ← (susunod na gagawin)
```

---

## 🚀 PAANO I-RUN SA LOCALHOST

### STEP 1 — I-setup ang Database (Navicat)

1. Buksan ang **Navicat**
2. Kumonekta sa iyong MySQL (localhost)
3. Right-click → **New Database** → pangalanan ng `efas_db`
4. Right-click sa `efas_db` → **Run SQL File**
5. Piliin ang `database/efas_schema.sql`
6. I-click ang **Start** — gagawa ito ng lahat ng tables at sample data

---

### STEP 2 — I-setup ang Backend

Buksan ang **VS Code terminal** sa `efas/backend` folder:

```bash
# 1. Pumunta sa backend folder
cd efas/backend

# 2. I-install ang dependencies
npm install

# 3. Gumawa ng .env file (kopyahin ang example)
copy .env.example .env

# 4. I-edit ang .env — baguhin ang DB_PASSWORD sa iyong MySQL password
```

**I-edit ang `.env`:**
```
DB_PASSWORD=your_actual_mysql_password
```

```bash
# 5. I-run ang backend
npm run dev
```

Dapat makita mo ito sa terminal:
```
╔══════════════════════════════════════════╗
║   E.F.A.S. Backend Server                ║
║   Solano, Nueva Vizcaya                  ║
║   Running on http://localhost:5000       ║
╚══════════════════════════════════════════╝
✅ MySQL connected — efas_db
```

---

### STEP 3 — Subukan ang API (optional)

Buksan ang browser o Postman:

```
# Health check
GET http://localhost:5000/

# Login bilang superadmin
POST http://localhost:5000/api/auth/login
Body: { "email": "superadmin@efas.gov.ph", "password": "changeme123" }

# QR scan (public)
GET http://localhost:5000/api/drivers/scan/EFAS-DRV-2024-001
```

> ⚠️ **Note:** Ang default password sa sample data ay placeholder lang.
> Kailangan munang i-update sa database gamit ang bcrypt hash.
> Sa susunod na hakbang gagawa tayo ng admin seeder script para dito.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/drivers/scan/:qrCode` | Public | QR scan — profile ng driver |
| POST | `/api/complaints` | Public | Mag-file ng complaint |
| POST | `/api/ratings` | Public | Mag-rate ng driver |
| POST | `/api/trips/start` | Public | Magsimula ng trip |
| GET | `/api/drivers` | Admin+ | Lahat ng drivers |
| POST | `/api/drivers` | Admin+ | Mag-enroll ng driver |
| PATCH | `/api/drivers/:id/status` | Admin+ | Suspend/activate |
| GET | `/api/drivers/:id/qr-image` | Admin+ | I-generate ang QR image |
| GET | `/api/complaints` | Admin+ | Lahat ng complaints |
| PATCH | `/api/complaints/:id` | Admin+ | I-update ang status |
| GET | `/api/stats` | Admin+ | Dashboard statistics |

---

## 🔒 Privacy Policy (Built-in)

- ❌ Hindi available ang real-time GPS location ng driver
- ✅ Makikita lang ng passenger ang route map habang aktibo ang trip
- ✅ Anonymous ang passenger sa ratings at complaints
- ✅ Superadmin at admin ay walang access sa location data

---

## 📅 Development Roadmap

- [x] **Part 1** — Database Schema (MySQL)
- [x] **Part 2** — Backend API (Node.js + Express)
- [ ] **Part 3** — Frontend (React) — Login pages, dashboards
- [ ] **Part 4** — QR Code print design
- [ ] **Part 5** — Route map (Leaflet.js)
- [ ] **Part 6** — Testing at deployment
