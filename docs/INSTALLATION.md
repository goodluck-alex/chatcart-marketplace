# 🛠 Installation Guide — ChatCart

Complete step-by-step installation for all environments:
**Development → Staging → Production**

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Development Setup (Local)](#2-development-setup-local)
3. [Docker Setup (Recommended for Teams)](#3-docker-setup-recommended-for-teams)
4. [Backend Dependencies](#4-backend-dependencies-postgresql--redis--meilisearch)
5. [Connecting Frontend to Backend](#5-connecting-frontend-to-backend)
6. [Common Errors & Fixes](#6-common-errors--fixes)

---

## 1. System Requirements

### Minimum Hardware

| Component | Development | Production |
|---|---|---|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disk | 20 GB SSD | 100+ GB SSD |
| OS | macOS / Ubuntu / Windows (WSL2) | Ubuntu 22.04 LTS |

### Required Software Versions

| Tool | Minimum Version | Recommended | Check |
|---|---|---|---|
| **Node.js** | 18.x | **20.x LTS** | `node --version` |
| **npm** | 9.x | **10.x** | `npm --version` |
| **PostgreSQL** | 14 | **16** | `psql --version` |
| **Redis** | 6.x | **7.x** | `redis-server --version` |
| **Git** | 2.x | latest | `git --version` |
| **Docker** (optional) | 24.x | latest | `docker --version` |
| **Docker Compose** | 2.x | latest | `docker compose version` |

---

## 2. Development Setup (Local)

### Step 1 — Install Node.js 20 LTS

**macOS (Homebrew)**
```bash
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node --version   # Should output: v20.x.x
```

**Ubuntu / Debian**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

**Windows (WSL2 recommended)**
```bash
# In WSL2 Ubuntu terminal:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Using nvm (any OS — recommended for switching versions)**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
```

---

### Step 2 — Clone the Repository

```bash
git clone https://github.com/your-org/chatcart.git
cd chatcart
```

---

### Step 3 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

**What gets installed:**

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.x | UI framework |
| `react-dom` | 19.x | DOM rendering |
| `vite` | 7.x | Build tool & dev server |
| `typescript` | 5.9.x | Type safety |
| `tailwindcss` | 4.x | Utility CSS framework |
| `@tanstack/react-query` | 5.x | Server state management |
| `axios` | 1.x | HTTP client |
| `zustand` | 5.x | Global state (Zustand) |
| `lucide-react` | latest | Icon library |
| `recharts` | 3.x | Analytics charts |
| `react-hot-toast` | 2.x | Toast notifications |
| `date-fns` | 4.x | Date formatting |
| `framer-motion` | 12.x | Animations |

---

### Step 4 — Set Up Frontend Environment

```bash
cp .env.example .env
```

For **development with mock data** (no backend needed):
```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_WS_URL=ws://localhost:3001
VITE_WHATSAPP_PHONE=256700000000
```

> 💡 **Mock Mode:** In `src/lib/hooks.ts`, `USE_MOCK = true` runs the full
> frontend without any backend. All data is realistic mock data.

---

### Step 5 — Start Frontend Development Server

```bash
npm run dev
```

```
  VITE v7.x.x  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
```

Open **http://localhost:5173** in your browser. ✅

---

### Step 6 — Install PostgreSQL

**macOS**
```bash
brew install postgresql@16
brew services start postgresql@16
# Create database
createdb chatcart_db
```

**Ubuntu**
```bash
sudo apt-get install -y postgresql-16 postgresql-client-16
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres psql << EOF
CREATE USER chatcart_user WITH PASSWORD 'dev_password_change_in_prod';
CREATE DATABASE chatcart_db OWNER chatcart_user;
GRANT ALL PRIVILEGES ON DATABASE chatcart_db TO chatcart_user;
\q
EOF
```

**Verify connection:**
```bash
psql -U chatcart_user -d chatcart_db -c "SELECT version();"
```

---

### Step 7 — Install Redis

**macOS**
```bash
brew install redis
brew services start redis
redis-cli ping   # Should return: PONG
```

**Ubuntu**
```bash
sudo apt-get install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping
```

**Set a password (recommended even in dev):**
```bash
# Edit /etc/redis/redis.conf
requirepass your_dev_redis_password
# Restart
sudo systemctl restart redis-server
```

---

### Step 8 — Install Meilisearch

**macOS / Linux (binary)**
```bash
curl -L https://install.meilisearch.com | sh
./meilisearch --master-key="your_master_key" --env="development"
# Runs at: http://localhost:7700
```

**Ubuntu (systemd service)**
```bash
curl -L https://install.meilisearch.com | sh
sudo mv ./meilisearch /usr/local/bin/
sudo tee /etc/systemd/system/meilisearch.service > /dev/null << EOF
[Unit]
Description=Meilisearch
After=network.target

[Service]
ExecStart=/usr/local/bin/meilisearch --master-key=your_master_key --env=production --db-path=/var/lib/meilisearch/data
Restart=on-failure
User=meilisearch

[Install]
WantedBy=multi-user.target
EOF

sudo useradd -r meilisearch
sudo mkdir -p /var/lib/meilisearch
sudo chown meilisearch:meilisearch /var/lib/meilisearch
sudo systemctl daemon-reload
sudo systemctl enable meilisearch
sudo systemctl start meilisearch
```

---

### Step 9 — Install Backend Dependencies

```bash
cd ../backend
npm install
cp .env.example .env
# Fill in database credentials, Redis, etc.

# Run database migrations
npm run migration:run

# Seed initial data (categories, admin user, plans)
npm run seed

# Start backend dev server
npm run start:dev
# API runs at: http://localhost:3001
```

---

## 3. Docker Setup (Recommended for Teams)

> One command to start the **entire stack** locally.

### Step 1 — Create `docker-compose.yml`

```yaml
# docker-compose.yml (place in project root)
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: chatcart_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: chatcart_db
      POSTGRES_USER: chatcart_user
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatcart_user -d chatcart_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: chatcart_redis
    restart: unless-stopped
    command: redis-server --requirepass dev_redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--pass", "dev_redis_password", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Meilisearch
  meilisearch:
    image: getmeili/meilisearch:v1.11
    container_name: chatcart_search
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: dev_master_key_change_in_prod
      MEILI_ENV: development
    volumes:
      - meilisearch_data:/meili_data
    ports:
      - "7700:7700"

  # NestJS Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chatcart_api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: development
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: chatcart_db
      DB_USER: chatcart_user
      DB_PASS: dev_password
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASS: dev_redis_password
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_MASTER_KEY: dev_master_key_change_in_prod
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: chatcart_web
    restart: unless-stopped
    environment:
      VITE_API_BASE_URL: http://localhost:3001/v1
      VITE_WS_URL: ws://localhost:3001
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

### Step 2 — Start All Services

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop everything
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

### Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/v1 |
| API Docs (Swagger) | http://localhost:3001/api |
| Meilisearch | http://localhost:7700 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 4. Backend Dependencies (PostgreSQL + Redis + Meilisearch)

### Required npm packages (backend)

```bash
# Core NestJS
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Auth
npm install passport passport-jwt passport-google-oauth20
npm install @nestjs/throttler                          # Rate limiting

# Database & Cache
npm install ioredis @nestjs/cache-manager cache-manager-ioredis

# Search
npm install meilisearch

# File Upload
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage  # Cloudflare R2 (S3-compatible)
npm install multer @types/multer

# Payments
npm install stripe                                     # Stripe
# MTN MoMo and Airtel — use their REST APIs directly with axios

# Notifications
npm install firebase-admin                             # FCM
npm install @sendgrid/mail                             # SendGrid email

# SMS
npm install africastalking                             # Africa's Talking

# Utilities
npm install class-validator class-transformer
npm install bcryptjs @types/bcryptjs
npm install uuid @types/uuid
npm install axios

# Dev tools
npm install --save-dev @nestjs/testing @types/passport-jwt
npm install --save-dev @nestjs/cli
```

---

## 5. Connecting Frontend to Backend

### Switch from Mock to Real API

Open `src/lib/hooks.ts` and change:

```typescript
// Line 14
const USE_MOCK = false; // ← Change from true to false
```

Then set your backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/v1
```

### Verify Connection

```bash
# Test the backend is reachable
curl http://localhost:3001/v1/health
# Expected: { "status": "ok", "timestamp": "..." }

# Test listings endpoint
curl http://localhost:3001/v1/listings?limit=5
```

---

## 6. Common Errors & Fixes

### ❌ `EADDRINUSE: address already in use :::5173`
```bash
# Find and kill the process using port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### ❌ `Cannot connect to PostgreSQL`
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection manually
psql -U chatcart_user -h localhost -d chatcart_db

# Common fix: wrong pg_hba.conf auth method
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Change 'peer' to 'md5' for local connections
sudo systemctl restart postgresql
```

### ❌ `Redis ECONNREFUSED`
```bash
# Start Redis
sudo systemctl start redis-server

# Test
redis-cli ping   # Should return PONG

# Check if password is wrong
redis-cli -a your_password ping
```

### ❌ `Module not found` after cloning
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ `Vite env variables undefined`
```bash
# Make sure variable name starts with VITE_
# Wrong:  API_URL=http://localhost:3001
# Right:  VITE_API_BASE_URL=http://localhost:3001/v1

# Restart dev server after changing .env
# Ctrl+C, then:
npm run dev
```

### ❌ `TypeScript errors on build`
```bash
# Check for type errors
npx tsc --noEmit

# Ignore non-critical errors during development
npm run build 2>&1 | grep -v "TS6133"
```

### ❌ `Meilisearch connection refused`
```bash
# Start Meilisearch
meilisearch --master-key="your_key"

# Or via Docker
docker run -p 7700:7700 getmeili/meilisearch:latest
```

### ❌ CORS errors in browser
```bash
# In NestJS backend main.ts, ensure CORS is configured:
app.enableCors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

---

## Verify Full Stack is Working

Run this checklist after setup:

```bash
# 1. Frontend loads
curl -s http://localhost:5173 | grep -o "ChatCart" | head -1

# 2. Backend health
curl -s http://localhost:3001/v1/health | python3 -m json.tool

# 3. Database connected (from backend logs)
grep "Database connected" backend/logs/app.log

# 4. Redis connected
redis-cli -a your_password ping

# 5. Meilisearch healthy
curl -s http://localhost:7700/health | python3 -m json.tool

# 6. Listings endpoint works
curl -s "http://localhost:3001/v1/listings?limit=3" | python3 -m json.tool
```

✅ When all 6 pass, your development environment is fully operational.
