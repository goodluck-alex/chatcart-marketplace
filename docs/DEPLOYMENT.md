# 🚀 Deployment Guide — ChatCart

Complete hosting and deployment instructions for all components.

---

## Table of Contents

1. [Deployment Overview](#1-deployment-overview)
2. [Frontend Deployment](#2-frontend-deployment)
3. [Backend Deployment (NestJS)](#3-backend-deployment-nestjs)
4. [Database (PostgreSQL)](#4-database-postgresql)
5. [Redis](#5-redis)
6. [Meilisearch](#6-meilisearch)
7. [Full VPS Setup (Ubuntu 22.04)](#7-full-vps-setup-ubuntu-2204)
8. [Domain & SSL Configuration](#8-domain--ssl-configuration)
9. [CI/CD Pipeline (GitHub Actions)](#9-cicd-pipeline-github-actions)
10. [Monitoring & Alerting](#10-monitoring--alerting)
11. [Scaling Strategy](#11-scaling-strategy)

---

## 1. Deployment Overview

### Recommended Stack (Cost-Optimised for African Startups)

```
┌──────────────────────────────────────────────────────────────┐
│  SERVICE              │  PROVIDER           │  MONTHLY COST  │
├──────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  Cloudflare Pages   │  FREE          │
│  Backend (NestJS)     │  Railway            │  ~$5–20        │
│  Database (PostgreSQL)│  Supabase / Neon    │  FREE → $25    │
│  Redis Cache          │  Upstash            │  FREE → $10    │
│  Search               │  Meilisearch Cloud  │  FREE → $30    │
│  File Storage         │  Cloudflare R2      │  ~$1–5         │
│  CDN + Security       │  Cloudflare         │  FREE          │
│  Emails               │  SendGrid           │  FREE → $15    │
│  Push Notifications   │  Firebase           │  FREE          │
│  Error Monitoring     │  Sentry             │  FREE          │
├──────────────────────────────────────────────────────────────┤
│  TOTAL STARTING COST  │                     │  ~$6–75/month  │
└──────────────────────────────────────────────────────────────┘
```

### Alternatively: VPS (More Control)

```
┌──────────────────────────────────────────────────────────────┐
│  VPS Provider    │  Specs                │  Monthly Cost     │
├──────────────────────────────────────────────────────────────┤
│  DigitalOcean    │  4vCPU, 8GB RAM, SSD  │  ~$48/month       │
│  Hetzner         │  4vCPU, 8GB RAM, SSD  │  ~$15/month ✅   │
│  Linode (Akamai) │  4vCPU, 8GB RAM, SSD  │  ~$36/month       │
│  Contabo         │  6vCPU, 16GB RAM, SSD │  ~$9/month  ✅   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Deployment

### Option A: Cloudflare Pages (Recommended — Free)

```bash
# Build the project
cd frontend
npm run build
# Output: dist/index.html (single self-contained file)
```

**Via Cloudflare Dashboard:**
1. Go to **Cloudflare → Pages → Create application**
2. Connect your GitHub repository
3. Build settings:
   ```
   Framework preset:  None (or Vite)
   Build command:     npm run build
   Build output:      dist
   Root directory:    frontend
   ```
4. Add environment variables:
   ```
   VITE_API_BASE_URL = https://api.chatcart.africa/v1
   VITE_WHATSAPP_PHONE = 256700000000
   ```
5. Deploy → your site is live at `chatcart.pages.dev`
6. Add custom domain: `chatcart.africa`

**Via CLI:**
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name chatcart
```

### Option B: Nginx on VPS

```nginx
# /etc/nginx/sites-available/chatcart-frontend
server {
    listen 80;
    listen [::]:80;
    server_name chatcart.africa www.chatcart.africa;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name chatcart.africa www.chatcart.africa;

    ssl_certificate     /etc/letsencrypt/live/chatcart.africa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatcart.africa/privkey.pem;

    root /var/www/chatcart/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/html application/javascript text/css application/json;

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Deploy frontend
cd frontend
npm run build
sudo cp -r dist/* /var/www/chatcart/frontend/dist/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 3. Backend Deployment (NestJS)

### Option A: Render

This repo is a monorepo — **`package.json` is not at the root**. You must set the root directory in Render.

**Quick fix (existing service):**

1. Open your service in the [Render Dashboard](https://dashboard.render.com)
2. Go to **Settings → Build & Deploy**
3. Set **Root Directory** to `chatcart-backend`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `npm run start:prod`
6. Add your environment variables (copy from `chatcart-backend/.env.example`)
7. **Manual Deploy → Deploy latest commit**

**Or use the included Blueprint** (`render.yaml` at repo root):

1. Render Dashboard → **New → Blueprint**
2. Connect `goodluck-alex/chatcart`
3. Render creates `chatcart-api` and `chatcart-frontend` with the correct root directories

Health check URL: `https://your-service.onrender.com/v1/health`

### Option B: Railway (Recommended — Easiest)

1. Go to **https://railway.app** → Create project
2. **Deploy from GitHub repo**
3. Select the `backend` folder as root
4. Railway auto-detects Node.js and builds it
5. Add environment variables in the Railway dashboard
6. Set custom domain: `api.chatcart.africa`

```bash
# Or via Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway up
```

### Option C: PM2 on VPS (Production-Grade)

```bash
# Install PM2 globally
npm install -g pm2

# Install backend dependencies
cd /var/www/chatcart/backend
npm install
npm run build

# Start with PM2
pm2 start dist/main.js \
  --name "chatcart-api" \
  --instances 2 \
  --exec-mode cluster \
  --max-memory-restart 512M \
  --env production

# Save process list (survives reboots)
pm2 save
pm2 startup   # Follow the displayed command
```

**PM2 ecosystem file** (`backend/ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'chatcart-api',
    script: 'dist/main.js',
    instances: 'max',          // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: '/var/log/chatcart/api-error.log',
    out_file: '/var/log/chatcart/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};

// Start with: pm2 start ecosystem.config.js --env production
```

### Option C: Docker on VPS

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 nodejs && adduser -S nestjs -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER nestjs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/v1/health || exit 1
CMD ["node", "dist/main.js"]
```

```bash
# Build and run
docker build -t chatcart-api:latest .
docker run -d \
  --name chatcart-api \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file /etc/chatcart/.env \
  chatcart-api:latest
```

### Nginx Reverse Proxy for Backend

```nginx
# /etc/nginx/sites-available/chatcart-api
upstream chatcart_api {
    server 127.0.0.1:3001;
    # For PM2 cluster mode:
    # server 127.0.0.1:3001;
    # server 127.0.0.1:3002;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.chatcart.africa;

    ssl_certificate     /etc/letsencrypt/live/api.chatcart.africa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.chatcart.africa/privkey.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    limit_req zone=api burst=50 nodelay;

    location /v1/ {
        proxy_pass http://chatcart_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://chatcart_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 4. Database (PostgreSQL)

### Option A: Supabase (Recommended for startups)

```
https://supabase.com → New project → chatcart
Region: us-east-1 (closest to East Africa)
Password: generate strong password

Connection string:
postgresql://postgres:[password]@db.xxxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres
```

Features: Built-in auth, real-time, auto-backups, 500MB free.

### Option B: Neon (Serverless PostgreSQL)

```
https://neon.tech → Create project → chatcart
Branching for dev/staging/prod environments
10GB free tier
```

### Option C: Self-Hosted on VPS

```bash
# Install PostgreSQL 16
sudo apt-get install -y postgresql-16

# Secure installation
sudo -u postgres psql << 'EOF'
ALTER USER postgres PASSWORD 'very_strong_root_password';
CREATE USER chatcart_user WITH PASSWORD 'production_db_password';
CREATE DATABASE chatcart_db OWNER chatcart_user;
GRANT ALL PRIVILEGES ON DATABASE chatcart_db TO chatcart_user;
\c chatcart_db
GRANT ALL ON SCHEMA public TO chatcart_user;
EOF

# Configure for remote connections (if backend is on separate server)
sudo nano /etc/postgresql/16/main/postgresql.conf
# listen_addresses = 'localhost'  # or '*' if remote

sudo nano /etc/postgresql/16/main/pg_hba.conf
# host  chatcart_db  chatcart_user  127.0.0.1/32  scram-sha-256

# Restart
sudo systemctl restart postgresql
```

**Automated Backups:**
```bash
# Create backup script
cat > /usr/local/bin/backup-chatcart-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/chatcart"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U chatcart_user chatcart_db | gzip > $BACKUP_DIR/chatcart_$DATE.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
# Upload to Cloudflare R2
# aws s3 cp $BACKUP_DIR/chatcart_$DATE.sql.gz s3://chatcart-backups/
EOF
chmod +x /usr/local/bin/backup-chatcart-db.sh

# Schedule daily at 2 AM
echo "0 2 * * * chatcart /usr/local/bin/backup-chatcart-db.sh" | sudo crontab -
```

---

## 5. Redis

### Option A: Upstash (Recommended — free tier)

```
https://upstash.com → Create database
Region: AWS eu-west-1 (Dublin — low latency to East Africa)
Type: Regional
```
Connection: `redis://default:password@eu1-xxx.upstash.io:6379`

### Option B: Redis Cloud

```
https://redis.io/try-free → 30MB free
```

### Option C: Self-Hosted

```bash
# Install
sudo apt-get install -y redis-server

# Configure
sudo nano /etc/redis/redis.conf
# requirepass your_redis_password
# maxmemory 512mb
# maxmemory-policy allkeys-lru

sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## 6. Meilisearch

### Option A: Meilisearch Cloud

```
https://cloud.meilisearch.com → New project
Region: eur (Europe — best latency to East Africa)
100K documents free
```

### Option B: VPS (Docker)

```bash
docker run -d \
  --name meilisearch \
  --restart unless-stopped \
  -p 7700:7700 \
  -v /var/lib/meilisearch:/meili_data \
  -e MEILI_MASTER_KEY="your_master_key" \
  -e MEILI_ENV="production" \
  getmeili/meilisearch:v1.11

# Nginx proxy for Meilisearch
# search.chatcart.africa → localhost:7700
```

---

## 7. Full VPS Setup (Ubuntu 22.04)

Complete setup from a fresh server:

```bash
# ── Initial Server Setup ──────────────────────────────────────────────────────
# SSH in as root
ssh root@your_server_ip

# Create deploy user
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Switch to deploy user
su - deploy

# Update system
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential ufw fail2ban

# ── Firewall ──────────────────────────────────────────────────────────────────
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# ── Fail2ban (Brute force protection) ────────────────────────────────────────
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# ── Install Node.js 20 LTS ────────────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # v20.x.x

# ── Install PM2 ───────────────────────────────────────────────────────────────
sudo npm install -g pm2

# ── Install Nginx ─────────────────────────────────────────────────────────────
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ── Install PostgreSQL 16 ─────────────────────────────────────────────────────
sudo apt-get install -y postgresql-16 postgresql-client-16
sudo systemctl enable postgresql

# ── Install Redis ─────────────────────────────────────────────────────────────
sudo apt-get install -y redis-server
sudo systemctl enable redis-server

# ── SSL with Let's Encrypt ────────────────────────────────────────────────────
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d chatcart.africa -d www.chatcart.africa -d api.chatcart.africa

# ── Clone & Deploy App ────────────────────────────────────────────────────────
cd /var/www
sudo mkdir chatcart && sudo chown deploy:deploy chatcart
git clone https://github.com/your-org/chatcart.git chatcart

# Frontend
cd /var/www/chatcart/frontend
cp .env.production .env
npm install
npm run build

# Backend
cd /var/www/chatcart/backend
cp .env.production .env
npm install
npm run build
npm run migration:run
pm2 start ecosystem.config.js --env production

# ── Create log directory ──────────────────────────────────────────────────────
sudo mkdir -p /var/log/chatcart
sudo chown deploy:deploy /var/log/chatcart

echo "✅ Server setup complete!"
```

---

## 8. Domain & SSL Configuration

### DNS Records (Cloudflare)

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` | `your_vps_ip` | ✅ Proxied |
| A | `www` | `your_vps_ip` | ✅ Proxied |
| A | `api` | `your_vps_ip` | ✅ Proxied |
| CNAME | `cdn` | `your-bucket.r2.cloudflarestorage.com` | ✅ Proxied |
| CNAME | `search` | `your-project.meilisearch.io` | ✅ Proxied |
| MX | `@` | `mail.sendgrid.net` | ❌ DNS only |
| TXT | `@` | `v=spf1 include:sendgrid.net ~all` | ❌ DNS only |

### Cloudflare Settings

```
SSL/TLS → Full (strict)
Speed → Minification → Enable all
Cache → Browser Cache TTL → 1 year (for static assets)
Security → WAF → Enable
Security → Bot Fight Mode → Enable
Page Rules → api.chatcart.africa/* → Cache Level: Bypass
```

---

## 9. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy ChatCart

on:
  push:
    branches: [main]

jobs:
  # ── Test ──────────────────────────────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci && npm run build
      - run: cd backend && npm ci && npm run test

  # ── Deploy Frontend ───────────────────────────────────────────────────────
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Build frontend
        working-directory: frontend
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_WHATSAPP_PHONE: ${{ secrets.VITE_WHATSAPP_PHONE }}
        run: npm ci && npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: chatcart
          directory: frontend/dist

  # ── Deploy Backend ────────────────────────────────────────────────────────
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/chatcart
            git pull origin main
            cd backend
            npm ci
            npm run build
            npm run migration:run
            pm2 reload chatcart-api --update-env
            echo "✅ Backend deployed at $(date)"
```

### GitHub Secrets to Set

```
Settings → Secrets → Actions → New repository secret

CLOUDFLARE_API_TOKEN    → Cloudflare API token
CLOUDFLARE_ACCOUNT_ID   → Your Cloudflare account ID
VITE_API_BASE_URL       → https://api.chatcart.africa/v1
VITE_WHATSAPP_PHONE     → 256700000000
VPS_HOST                → your.server.ip.address
VPS_SSH_KEY             → (paste private SSH key)
```

---

## 10. Monitoring & Alerting

### Uptime Monitoring (Free)

```bash
# UptimeRobot — https://uptimerobot.com (free 50 monitors)
# Monitor these endpoints:
# https://chatcart.africa             → HTTP(S) 200
# https://api.chatcart.africa/v1/health → HTTP(S) 200
# https://search.chatcart.africa/health → HTTP(S) 200
```

### Server Monitoring

```bash
# Install netdata (free real-time monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
# Dashboard at: http://your-server:19999
```

### Log Monitoring

```bash
# View PM2 logs
pm2 logs chatcart-api --lines 100

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
tail -f /var/log/chatcart/api-error.log
```

### Alerts

```bash
# PM2 memory alert
pm2 set pm2-slack:slack_url https://hooks.slack.com/YOUR_WEBHOOK
pm2 install pm2-slack

# Or use PM2 Plus: https://pm2.io (free 2 servers)
```

---

## 11. Scaling Strategy

### Phase 1 (0–10K users): Single VPS

```
1 VPS (4 vCPU, 8GB RAM):
- Nginx + Frontend + Backend (PM2)
- PostgreSQL + Redis + Meilisearch
Cost: ~$15–48/month
```

### Phase 2 (10K–100K users): Managed Services

```
Frontend  → Cloudflare Pages (free, globally distributed)
Backend   → Railway / Render (auto-scale, $25–100/month)
Database  → Supabase Pro ($25/month, auto-scaling)
Redis     → Upstash ($10–30/month)
Search    → Meilisearch Cloud ($30/month)
Storage   → Cloudflare R2 (~$5/month)
Total: ~$95–165/month
```

### Phase 3 (100K+ users): Full Cloud

```
Frontend  → Cloudflare Pages (unchanged)
Backend   → Kubernetes (GKE / EKS) with auto-scaling
Database  → PostgreSQL with read replicas + PgBouncer
Cache     → Redis Cluster (ElastiCache)
Search    → Dedicated Meilisearch cluster
CDN       → Cloudflare Enterprise
Queue     → Redis Queues (Bull) for background jobs
Cost: $500–2000+/month
```

---

## Deployment Checklist

Before going live, verify:

```
□ All environment variables set in production
□ SSL certificates valid and auto-renewing
□ Database migrations run successfully
□ Seed data loaded (categories, plans, admin user)
□ All payment webhooks configured and tested
□ WhatsApp webhook verified
□ FCM push notifications tested end-to-end
□ Meilisearch index populated with listings
□ Cloudflare WAF enabled
□ Rate limiting configured on API
□ Automated database backups scheduled
□ Uptime monitoring configured
□ Sentry error tracking enabled
□ Admin account created with strong password + 2FA
□ Terms of Service and Privacy Policy pages live
□ GDPR/data protection compliance checked
□ Load test run (simulate 100 concurrent users)
```

✅ When all boxes are checked — you're ready to launch! 🚀
