# 🔑 Environment Variables — ChatCart

This document describes every environment variable used across the ChatCart
frontend (React/Vite) and backend (NestJS). Keep all secrets out of version
control — never commit a `.env` file with real credentials.

---

## Frontend Variables (Vite — prefix `VITE_`)

> Vite only exposes variables that begin with `VITE_` to the browser bundle.  
> File: `frontend/.env` (copy from `frontend/.env.example`)

### Required

```env
# ── API ───────────────────────────────────────────────────────────────────────
# Base URL of your NestJS backend API (no trailing slash)
VITE_API_BASE_URL=https://api.chatcart.africa/v1

# WebSocket server URL for real-time chat and notifications
VITE_WS_URL=wss://api.chatcart.africa

# ── WhatsApp ──────────────────────────────────────────────────────────────────
# WhatsApp Business phone number (digits only, no + or spaces)
# Used as fallback when a seller has no individual WhatsApp number
VITE_WHATSAPP_PHONE=256700000000
```

### Optional (enable specific features)

```env
# ── Google OAuth ──────────────────────────────────────────────────────────────
# Get from: https://console.cloud.google.com → APIs & Services → Credentials
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

# ── Firebase (Push Notifications) ────────────────────────────────────────────
# Web Push VAPID public key — from Firebase Console → Project Settings → Cloud Messaging
VITE_FCM_VAPID_KEY=BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Meilisearch (Search) ──────────────────────────────────────────────────────
# Public search-only key (safe to expose — read-only)
VITE_MEILISEARCH_URL=https://search.chatcart.africa
VITE_MEILISEARCH_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Cloudflare R2 (CDN for images) ───────────────────────────────────────────
# Public CDN domain pointing to your R2 bucket
VITE_CLOUDFLARE_R2_URL=https://cdn.chatcart.africa

# ── Sentry (Error Monitoring) ─────────────────────────────────────────────────
VITE_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0.ingest.sentry.io/0
```

### Development overrides

```env
# Override to use local backend during development
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_WS_URL=ws://localhost:3001
```

---

## Backend Variables (NestJS)

> File: `backend/.env` (copy from `backend/.env.example`)  
> ⚠️ These are **server-side only** — never expose them to the browser.

### Application

```env
# ── App ───────────────────────────────────────────────────────────────────────
NODE_ENV=production           # development | staging | production
PORT=3001                     # Port NestJS listens on
APP_URL=https://api.chatcart.africa
FRONTEND_URL=https://chatcart.africa
ALLOWED_ORIGINS=https://chatcart.africa,https://admin.chatcart.africa
```

### Database (PostgreSQL)

```env
# ── PostgreSQL ────────────────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatcart_db
DB_USER=chatcart_user
DB_PASS=your_very_secure_password_here
DB_SSL=true                   # true in production
DB_POOL_MIN=2
DB_POOL_MAX=20

# Alternative: single connection string (overrides above)
DATABASE_URL=postgresql://chatcart_user:password@localhost:5432/chatcart_db?sslmode=require
```

### Cache (Redis)

```env
# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=your_redis_password
REDIS_TLS=false               # true when using managed Redis (Upstash, Redis Cloud)

# Alternative: single URL
REDIS_URL=redis://:password@localhost:6379
```

### Authentication & Security

```env
# ── JWT ───────────────────────────────────────────────────────────────────────
# Generate with: openssl rand -hex 64
JWT_SECRET=your_256_bit_random_secret_here_never_share_this
JWT_EXPIRES_IN=15m            # Access token lifetime
JWT_REFRESH_SECRET=another_completely_different_256_bit_secret
JWT_REFRESH_EXPIRES_IN=30d    # Refresh token lifetime

# ── OTP ───────────────────────────────────────────────────────────────────────
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6

# ── Encryption ────────────────────────────────────────────────────────────────
# For encrypting sensitive data at rest (e.g. payment refs)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your_32_byte_hex_encryption_key
```

### Google OAuth

```env
# ── Google OAuth ──────────────────────────────────────────────────────────────
# Get from: https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://api.chatcart.africa/v1/auth/google/callback
```

### Apple Login

```env
# ── Apple Sign In ─────────────────────────────────────────────────────────────
# Get from: https://developer.apple.com → Certificates, Identifiers & Profiles
APPLE_CLIENT_ID=africa.chatcart.app      # Your Services ID
APPLE_TEAM_ID=XXXXXXXXXX                 # 10-char Team ID
APPLE_KEY_ID=XXXXXXXXXX                  # 10-char Key ID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----"
```

### Africa's Talking (SMS / OTP)

```env
# ── Africa's Talking ──────────────────────────────────────────────────────────
# Sign up at: https://africastalking.com
# Use 'sandbox' username + sandbox API key for development
AT_USERNAME=chatcart                     # Your Africa's Talking username
AT_API_KEY=atsk_xxxxxxxxxxxxxxxxxxxxxxxx # API key from dashboard
AT_SENDER_ID=ChatCart                    # Approved sender ID (or leave blank)
AT_ENVIRONMENT=production                # sandbox | production
```

### MTN Mobile Money

```env
# ── MTN Mobile Money (Collections & Disbursements) ───────────────────────────
# Docs: https://momodeveloper.mtn.com
# Apply at: https://momodeveloper.mtn.com/developer
MTN_MOMO_BASE_URL=https://proxy.momoapi.mtn.com    # prod (sandbox: sandbox.momodeveloper.mtn.com)
MTN_MOMO_COLLECTION_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MTN_MOMO_COLLECTION_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MTN_MOMO_COLLECTION_PRIMARY_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MTN_MOMO_DISBURSEMENT_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MTN_MOMO_DISBURSEMENT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MTN_MOMO_DISBURSEMENT_PRIMARY_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MTN_MOMO_CURRENCY=UGX
MTN_MOMO_ENVIRONMENT=production          # sandbox | production
MTN_MOMO_CALLBACK_URL=https://api.chatcart.africa/v1/payments/mtn/callback
```

### Airtel Money

```env
# ── Airtel Money ──────────────────────────────────────────────────────────────
# Docs: https://developers.airtel.africa
# Apply at: https://developers.airtel.africa/user/register
AIRTEL_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AIRTEL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AIRTEL_BASE_URL=https://openapi.airtel.africa        # prod
AIRTEL_CURRENCY=UGX
AIRTEL_COUNTRY=UG                        # UG | KE | TZ
AIRTEL_CALLBACK_URL=https://api.chatcart.africa/v1/payments/airtel/callback
```

### Stripe

```env
# ── Stripe (Card Payments) ────────────────────────────────────────────────────
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_CURRENCY=usd
```

### Firebase (Push Notifications)

```env
# ── Firebase Cloud Messaging ──────────────────────────────────────────────────
# Get from: Firebase Console → Project Settings → Service Accounts → Generate Key
FIREBASE_PROJECT_ID=chatcart-africa
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chatcart-africa.iam.gserviceaccount.com
# Escape newlines with \n — or use base64 encoded JSON
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAK...\n-----END RSA PRIVATE KEY-----"

# Alternative: path to service account JSON file
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Web Push VAPID keys
FCM_VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FCM_VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SendGrid (Email)

```env
# ── SendGrid ──────────────────────────────────────────────────────────────────
# Get from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@chatcart.africa
SENDGRID_FROM_NAME=ChatCart
# Template IDs from SendGrid Dynamic Templates
SENDGRID_TEMPLATE_WELCOME=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_ORDER_CONFIRM=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_RECEIPT=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_OTP=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Cloudflare R2 (File Storage)

```env
# ── Cloudflare R2 ─────────────────────────────────────────────────────────────
# Get from: Cloudflare Dashboard → R2 → Manage R2 API Tokens
CF_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=chatcart-media
R2_PUBLIC_URL=https://cdn.chatcart.africa   # Custom domain or r2.dev subdomain
R2_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.cloudflarestorage.com
```

### Meilisearch (Search)

```env
# ── Meilisearch ───────────────────────────────────────────────────────────────
# Self-hosted or Meilisearch Cloud: https://cloud.meilisearch.com
MEILISEARCH_HOST=https://search.chatcart.africa
MEILISEARCH_MASTER_KEY=your_meilisearch_master_key_here    # Keep secret!
MEILISEARCH_SEARCH_KEY=public_search_only_key               # Safe to expose
```

### WhatsApp Business API

```env
# ── WhatsApp Business (Meta Cloud API) ───────────────────────────────────────
# Apply at: https://developers.facebook.com → WhatsApp → Getting Started
WA_PHONE_NUMBER_ID=1234567890123456         # From Meta Business Suite
WA_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WA_VERIFY_TOKEN=your_random_webhook_verify_token_here
WA_WEBHOOK_URL=https://api.chatcart.africa/v1/whatsapp/webhook
WA_BUSINESS_ACCOUNT_ID=1234567890123456
```

### Monitoring & Logging

```env
# ── Sentry ────────────────────────────────────────────────────────────────────
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0.ingest.sentry.io/0

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL=info                # error | warn | info | debug | verbose
LOG_FORMAT=json               # json | pretty
```

---

## How to Generate Secrets

```bash
# JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption key (256-bit)
openssl rand -hex 32

# Random token
openssl rand -base64 32

# OTP verify token (WhatsApp webhook)
node -e "console.log(Math.random().toString(36).substring(2, 15))"
```

---

## Security Rules

| Rule | Why |
|---|---|
| ✅ Use `.env.example` with dummy values | Documents variables safely |
| ❌ Never commit `.env` to git | Add to `.gitignore` |
| ✅ Use different secrets per environment | Dev / Staging / Production |
| ✅ Rotate secrets quarterly | Limits blast radius of leaks |
| ✅ Use a secrets manager in production | AWS Secrets Manager / Vault / Railway Secrets |
| ❌ Never log secrets or tokens | Logs may be stored insecurely |
| ✅ Restrict IP access to admin endpoints | Cloudflare Access / VPN |

---

## `.env.example` Template

> Copy this file to `.env` and fill in real values.  
> All files: `frontend/.env.example` and `backend/.env.example`

```env
# ─── Frontend (.env.example) ──────────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_WS_URL=ws://localhost:3001
VITE_WHATSAPP_PHONE=256700000000
VITE_GOOGLE_CLIENT_ID=
VITE_FCM_VAPID_KEY=
VITE_MEILISEARCH_URL=http://localhost:7700
VITE_MEILISEARCH_KEY=
VITE_CLOUDFLARE_R2_URL=https://cdn.chatcart.africa
VITE_SENTRY_DSN=
```
