# 🛒 ChatCart — Buy. Sell. Rent. Book. Hire.

> Africa's leading WhatsApp-powered marketplace.  
> Full monorepo: **React frontend** + **NestJS backend** + **PostgreSQL database** — all connected via REST API.

---

## 📁 Complete Project Structure

```
chatcart/                                ← Monorepo root
│
├── 📂 src/  (Frontend — React 19 + Vite + Tailwind)
│   ├── admin/                           ← Admin console (Dashboard, Users, Listings, Orders)
│   ├── components/                      ← Shared UI (Navbar, ListingCard, Footer)
│   ├── pages/                           ← All page components
│   └── lib/
│       ├── api.ts                       ← Typed Axios client → calls backend REST API
│       ├── config.ts                    ← Reads VITE_* environment variables
│       ├── hooks.ts                     ← React Query hooks (USE_MOCK toggle here)
│       ├── mock-data.ts                 ← Dev mock data (mirrors real API shapes)
│       ├── store.ts                     ← Zustand global state (auth, nav, wishlist)
│       └── types.ts                     ← Shared TypeScript types
│
├── 📂 backend/  (NestJS 10 + TypeORM + PostgreSQL)
│   └── src/
│       ├── auth/                        ← JWT, OTP login, refresh tokens, strategies
│       ├── users/                       ← User CRUD, profiles
│       ├── listings/                    ← Listing CRUD, WhatsApp click tracking
│       ├── stores/                      ← Business store profiles
│       ├── orders/                      ← Order lifecycle management
│       ├── payments/                    ← MTN MoMo, Airtel Money, Stripe
│       ├── reviews/                     ← Ratings, replies
│       ├── notifications/               ← FCM push, SMS (Africa's Talking), Email
│       ├── whatsapp/                    ← Lead tracking, Meta webhook, send messages
│       ├── upload/                      ← Cloudflare R2 image upload
│       ├── search/                      ← Meilisearch full-text search proxy
│       ├── admin/                       ← Platform stats, moderation, all admin endpoints
│       ├── health/                      ← GET /v1/health system check
│       ├── common/                      ← Guards, decorators, interceptors, filters
│       ├── database/
│       │   ├── data-source.ts           ← TypeORM CLI data source config
│       │   ├── migrations/              ← Versioned schema migrations
│       │   └── seeds/                   ← Development seed data
│       ├── app.module.ts                ← Root NestJS module (wires everything)
│       └── main.ts                      ← Bootstrap: CORS, Swagger, validation, port
│
├── 📂 database/  (Raw PostgreSQL files)
│   ├── schema.sql                       ← Full schema — 12 tables, enums, indexes
│   ├── seeds.sql                        ← Sample data (users, listings, reviews, leads)
│   └── indexes.sql                      ← Extra performance indexes for production
│
├── 📂 docs/                             ← Developer documentation
│   ├── INSTALLATION.md                  ← Full local setup guide
│   ├── ENVIRONMENT_VARIABLES.md         ← Every env var explained
│   ├── SERVICES_SETUP.md               ← Africa's Talking, MTN MoMo, Firebase etc.
│   ├── BACKEND_GUIDE.md                ← NestJS module guide + API reference
│   ├── DATABASE_SCHEMA.md              ← Full schema documentation
│   ├── DEPLOYMENT.md                   ← Hosting on Cloudflare/Railway/VPS
│   └── CONTRIBUTING.md                 ← PR process, commit style
│
├── .env.example                         ← Frontend environment template
├── backend/.env.example                 ← Backend environment template
├── start-dev.sh                         ← One-command dev startup script
└── README.md                            ← This file
```

---

## 🔗 How Frontend Connects to Backend

```
┌─────────────────────────────────────────────────────────┐
│  Browser  (React 19 + Vite)                             │
│  http://localhost:5173                                   │
│                                                         │
│  src/lib/hooks.ts        ← React Query hooks            │
│    └── USE_MOCK = false  ← switch to real API           │
│  src/lib/api.ts          ← Axios client                 │
│    └── Authorization: Bearer {jwt_token}                │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP/JSON  (VITE_API_BASE_URL)
                           ▼
┌─────────────────────────────────────────────────────────┐
│  NestJS Backend                                         │
│  http://localhost:3001/v1                               │
│                                                         │
│  POST /v1/auth/otp/send      ← send OTP via SMS        │
│  POST /v1/auth/otp/verify    ← verify → return JWT     │
│  GET  /v1/listings           ← paginated listings      │
│  POST /v1/listings           ← create listing          │
│  GET  /v1/search?q=macbook   ← Meilisearch search     │
│  POST /v1/payments/mtn/...   ← MTN MoMo payment       │
│  GET  /v1/admin/stats        ← admin dashboard data   │
│  GET  /v1/health             ← system health check    │
│  ...and 40+ more endpoints                             │
└──────────┬──────────────────────────────────────────────┘
           │
    ┌──────┴──────────────────────────────┐
    │                                     │
    ▼                                     ▼
PostgreSQL 16                           Redis 7
database/schema.sql                     Sessions, OTP, Cache
12 tables, full schema
    │
    ▼
Meilisearch        ← search index (listings)
Cloudflare R2      ← image storage + CDN
Africa's Talking   ← SMS OTP
Firebase FCM       ← push notifications
MTN MoMo           ← mobile money payments
Airtel Money       ← mobile money payments
Stripe             ← card payments
SendGrid           ← transactional email
WhatsApp API       ← automated messages
```

---

## ⚡ Quick Start

### Option A — One command (Linux/macOS)

```bash
git clone https://github.com/your-org/chatcart.git
cd chatcart
bash start-dev.sh
```

### Option B — Manual step-by-step

```bash
# ── 1. Clone ──────────────────────────────────────────────
git clone https://github.com/your-org/chatcart.git
cd chatcart

# ── 2. Database ───────────────────────────────────────────
createdb chatcart_db
psql chatcart_db < database/schema.sql   # creates all 12 tables
psql chatcart_db < database/seeds.sql    # loads sample data

# ── 3. Backend ────────────────────────────────────────────
cd backend
npm install
cp .env.example .env          # fill in DB_HOST, DB_PASS, JWT_SECRET
npm run start:dev             # → http://localhost:3001
#   Swagger docs → http://localhost:3001/api
#   Health check → http://localhost:3001/v1/health

# ── 4. Frontend (new terminal) ────────────────────────────
cd ..
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3001/v1
npm run dev                   # → http://localhost:5173
```

### Option C — Docker (entire stack)

```bash
docker compose up -d
# Frontend  → http://localhost:5173
# Backend   → http://localhost:3001
# Swagger   → http://localhost:3001/api
# Postgres  → localhost:5432
# Redis     → localhost:6379
# Meili     → http://localhost:7700
```

---

## 🔄 Switch from Mock Data → Real Backend

The frontend ships with `USE_MOCK = true` so it works immediately with no backend.  
When your backend is running, flip the switch in **one file**:

```typescript
// src/lib/hooks.ts  — Line ~14
const USE_MOCK = false;   // ← change from true to false
```

That's it. All 20+ React Query hooks automatically call the real API.

---

## 🌐 API Endpoints (40+ routes)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/v1/auth/otp/send` | — | Send OTP via SMS |
| POST | `/v1/auth/otp/verify` | — | Verify OTP → JWT tokens |
| POST | `/v1/auth/refresh` | — | Refresh access token |
| GET | `/v1/auth/me` | JWT | Get current user |
| GET | `/v1/listings` | — | List/filter listings |
| POST | `/v1/listings` | JWT | Create listing |
| GET | `/v1/listings/:id` | — | Get listing detail |
| GET | `/v1/listings/featured` | — | Get featured listings |
| PATCH | `/v1/listings/:id` | JWT | Update listing |
| DELETE | `/v1/listings/:id` | JWT | Delete listing |
| POST | `/v1/listings/:id/view` | — | Track view |
| POST | `/v1/listings/:id/whatsapp-click` | — | Track WA lead |
| GET | `/v1/users/me` | JWT | My profile |
| PATCH | `/v1/users/me` | JWT | Update profile |
| GET | `/v1/stores` | — | List stores |
| POST | `/v1/stores` | JWT | Create store |
| GET | `/v1/stores/slug/:slug` | — | Store by slug |
| PATCH | `/v1/stores/mine` | JWT | Update my store |
| GET | `/v1/orders/mine` | JWT | My orders (buyer) |
| POST | `/v1/orders` | JWT | Place order |
| POST | `/v1/payments/mtn/initiate` | JWT | MTN MoMo payment |
| POST | `/v1/payments/airtel/initiate` | JWT | Airtel Money payment |
| POST | `/v1/payments/stripe/intent` | JWT | Stripe PaymentIntent |
| POST | `/v1/payments/mtn/callback` | — | MTN webhook |
| POST | `/v1/reviews` | JWT | Submit review |
| GET | `/v1/reviews/seller/:id` | — | Seller reviews |
| POST | `/v1/upload/image` | JWT | Upload to R2 |
| GET | `/v1/search?q=...` | — | Meilisearch search |
| GET | `/v1/search/suggestions` | — | Autocomplete |
| GET | `/v1/notifications` | JWT | My notifications |
| POST | `/v1/whatsapp/leads/:listingId` | — | Record WA lead |
| GET | `/v1/whatsapp/leads` | JWT | Seller leads |
| **GET** | `/v1/admin/stats` | Admin | Platform stats |
| **GET** | `/v1/admin/users` | Admin | All users |
| **POST** | `/v1/admin/users/:id/ban` | Admin | Ban user |
| **POST** | `/v1/admin/listings/:id/approve` | Admin | Approve listing |
| **GET** | `/v1/admin/orders` | Admin | All orders |
| **GET** | `/v1/health` | — | System health |

Full interactive docs at **http://localhost:3001/api** (Swagger UI).

---

## 🗄 Database (12 Tables)

```
users               → all accounts (buyers, sellers, admins)
login_sessions      → JWT refresh token store
stores              → business profiles
listings            → all marketplace listings (JSONB attributes)
listing_images      → images stored in Cloudflare R2
orders              → buyer-seller transaction records
payments            → MTN MoMo / Airtel / Stripe payment records
reviews             → seller ratings and review text
notifications       → in-app + push notification records
whatsapp_leads      → every WA click tracked per listing
wishlist_items      → user saved/favourited listings
```

---

## 🌍 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | 19 / 7 |
| Styling | Tailwind CSS | 4.x |
| State | Zustand + TanStack Query | 5.x |
| HTTP Client | Axios | 1.x |
| Backend | NestJS | 10.x |
| Language | TypeScript | 5.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16 |
| Cache / Sessions | Redis | 7.x |
| Search | Meilisearch | 1.11 |
| File Storage | Cloudflare R2 | S3 SDK |
| Auth | JWT + Passport | — |
| SMS / OTP | Africa's Talking | — |
| Payments | MTN MoMo + Airtel + Stripe | — |
| Push | Firebase FCM | — |
| Email | SendGrid | — |
| WhatsApp | Meta Business Cloud API | v18 |

---

## 📄 Documentation

| File | What it covers |
|---|---|
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Prerequisites, step-by-step local setup, Docker, troubleshooting |
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | Every env var for frontend AND backend |
| [docs/SERVICES_SETUP.md](docs/SERVICES_SETUP.md) | Africa's Talking, MTN MoMo, Firebase, Cloudflare R2 etc. |
| [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) | NestJS modules, entities, auth flow code samples |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | All 12 tables, full SQL, indexes, cron jobs |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Cloudflare Pages, Railway, VPS, Docker, CI/CD |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branch strategy, commit style, PR process |

---

## 🔑 Default Admin Account (after seeding)

```
Phone:  +256700000000
Email:  admin@chatcart.africa
Role:   superadmin
```

Use the OTP login → **check backend terminal logs** for the 6-digit dev OTP code.  
Admin console is at → http://localhost:5173 → click **🛡 Admin** in the navbar.

---

## 📄 License

MIT © 2025 ChatCart — Built for East Africa 🌍
