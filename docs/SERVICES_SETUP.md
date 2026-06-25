# 🌐 Third-Party Services Setup — ChatCart

Step-by-step instructions for setting up every external service ChatCart depends on.

---

## Table of Contents

1. [Africa's Talking (SMS / OTP)](#1-africas-talking-sms--otp)
2. [MTN Mobile Money](#2-mtn-mobile-money)
3. [Airtel Money](#3-airtel-money)
4. [Stripe (Card Payments)](#4-stripe-card-payments)
5. [Firebase FCM (Push Notifications)](#5-firebase-fcm-push-notifications)
6. [SendGrid (Email)](#6-sendgrid-email)
7. [Cloudflare R2 (File Storage + CDN)](#7-cloudflare-r2-file-storage--cdn)
8. [Meilisearch (Search)](#8-meilisearch-search)
9. [Google OAuth (Social Login)](#9-google-oauth-social-login)
10. [Apple Sign In](#10-apple-sign-in)
11. [WhatsApp Business API](#11-whatsapp-business-api)
12. [Sentry (Error Monitoring)](#12-sentry-error-monitoring)

---

## 1. Africa's Talking (SMS / OTP)

Used for: Phone OTP login, order SMS alerts, low-cost SMS in East Africa.

### Registration

1. Go to **https://africastalking.com**
2. Click **Create Free Account**
3. Fill in your details — choose **Uganda** as primary country
4. Verify your phone number
5. Log in to the dashboard

### Get API Credentials

```
Dashboard → Settings → API Key
```

Copy your:
- **Username** (usually your email or app name)
- **API Key** (long alphanumeric string)

### Sandbox vs Production

| Mode | Username | Notes |
|---|---|---|
| Sandbox | `sandbox` | Free, fake SMS, test only |
| Production | Your username | Real SMS, charged per message |

### Sandbox Testing

```bash
# Test sending OTP in sandbox
curl -X POST "https://api.sandbox.africastalking.com/version1/messaging" \
  -H "apiKey: your_sandbox_api_key" \
  -H "Accept: application/json" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=sandbox&to=+256700000000&message=Your ChatCart OTP is: 123456"
```

### Uganda Sender ID Registration

- Apply for a dedicated Sender ID (e.g., `ChatCart`) via the dashboard
- Approval takes 3–7 business days
- Cost: ~$50 USD per year
- Without Sender ID: messages show as "AT" or generic number

### Pricing (2025)

| Country | SMS Cost |
|---|---|
| Uganda | UGX 65/SMS (~$0.017) |
| Kenya | KES 1/SMS (~$0.008) |
| Tanzania | TZS 20/SMS (~$0.008) |

### Environment Variables

```env
AT_USERNAME=chatcart
AT_API_KEY=atsk_xxxxxxxxxxxxxxxxxxxxxxxx
AT_SENDER_ID=ChatCart
AT_ENVIRONMENT=production
```

---

## 2. MTN Mobile Money

Used for: Subscription payments, listing fees, featured listings (Uganda primary).

### Register as a Developer

1. Go to **https://momodeveloper.mtn.com**
2. Click **Sign Up** → Create developer account
3. Verify your email
4. Navigate to **Products** → Subscribe to:
   - **Collection** (receive money)
   - **Disbursement** (send money — for refunds)
   - **Remittance** (optional)

### Create API User (Sandbox)

```bash
# Step 1: Create API user
curl -X POST "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser" \
  -H "X-Reference-Id: $(uuidgen)" \
  -H "Ocp-Apim-Subscription-Key: your_collection_primary_key" \
  -H "Content-Type: application/json" \
  -d '{"providerCallbackHost": "https://api.chatcart.africa"}'

# Step 2: Get API key for that user
curl -X POST "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/{X-Reference-Id}/apikey" \
  -H "Ocp-Apim-Subscription-Key: your_collection_primary_key"
```

### Collection Flow (Receive Payment)

```
1. POST /collection/v1_0/requesttopay  → Initiate
2. Customer receives USSD prompt
3. Customer approves on phone
4. MTN sends webhook to CALLBACK_URL
5. GET /collection/v1_0/requesttopay/{referenceId} → Verify status
```

### Go Live Checklist

- [ ] Complete KYC on MTN developer portal
- [ ] Submit application for production access
- [ ] Receive production API credentials (5–10 business days)
- [ ] Test with real UGX amounts (minimum 500 UGX)
- [ ] Set up webhook endpoint with HTTPS

### Sandbox Test Numbers (Uganda)

| Number | Behavior |
|---|---|
| +256242424244 | SUCCESSFUL |
| +256242424245 | FAILED |
| +256242424246 | PENDING (timeout) |

### Environment Variables

```env
MTN_MOMO_BASE_URL=https://proxy.momoapi.mtn.com
MTN_MOMO_COLLECTION_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MTN_MOMO_COLLECTION_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MTN_MOMO_COLLECTION_PRIMARY_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MTN_MOMO_CURRENCY=UGX
MTN_MOMO_ENVIRONMENT=production
MTN_MOMO_CALLBACK_URL=https://api.chatcart.africa/v1/payments/mtn/callback
```

---

## 3. Airtel Money

Used for: Payments from Airtel subscribers (Uganda, Kenya, Tanzania).

### Register

1. Go to **https://developers.airtel.africa**
2. Register as a developer
3. Create a new application
4. Note your **Client ID** and **Client Secret**

### Authentication Flow

```bash
# Get access token (expires in 1 hour)
curl -X POST "https://openapi.airtel.africa/auth/oauth2/token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "grant_type": "client_credentials"
  }'
```

### Payment Initiation

```bash
curl -X POST "https://openapi.airtel.africa/merchant/v1/payments/" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -H "X-Country: UG" \
  -H "X-Currency: UGX" \
  -d '{
    "reference": "CC-ORDER-001",
    "subscriber": {
      "country": "UG",
      "currency": "UGX",
      "msisdn": "256701234567"
    },
    "transaction": {
      "amount": 50000,
      "country": "UG",
      "currency": "UGX",
      "id": "unique-transaction-id"
    }
  }'
```

### Environment Variables

```env
AIRTEL_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AIRTEL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_CURRENCY=UGX
AIRTEL_COUNTRY=UG
AIRTEL_CALLBACK_URL=https://api.chatcart.africa/v1/payments/airtel/callback
```

---

## 4. Stripe (Card Payments)

Used for: International buyers, diaspora payments, cards.

### Setup

1. Go to **https://stripe.com** → Create account
2. Verify your business (Uganda or Kenya entity)
3. Go to **Developers → API Keys**
4. Copy **Publishable Key** and **Secret Key**

### Install Stripe

```bash
# Backend
npm install stripe

# Frontend (for Stripe.js — if using Stripe Elements)
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Payment Intent Flow

```typescript
// Backend: Create PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 250000,      // In smallest currency unit (cents for USD)
  currency: 'usd',
  metadata: { orderId: 'CC-2024-001234', listingId: 'lst_01' },
});

// Return client_secret to frontend
return { clientSecret: paymentIntent.client_secret };
```

### Webhook Setup

```bash
# Install Stripe CLI for local webhook testing
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:3001/v1/payments/stripe/webhook
```

### Webhook Events to Handle

```
payment_intent.succeeded    → Mark order as paid
payment_intent.payment_failed → Notify user
customer.subscription.created → Activate plan
customer.subscription.deleted → Downgrade plan
invoice.payment_failed        → Send dunning email
```

### Environment Variables

```env
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

---

## 5. Firebase FCM (Push Notifications)

Used for: All push notifications to web, Android, and iOS.

### Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **Create a project** → name it `chatcart-africa`
3. Disable Google Analytics (optional)
4. Project is created

### Add Web App

```
Project Settings → Your apps → </> (Web)
App nickname: ChatCart Web
```

Copy the Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "chatcart-africa.firebaseapp.com",
  projectId: "chatcart-africa",
  storageBucket: "chatcart-africa.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Get VAPID Key (Web Push)

```
Project Settings → Cloud Messaging → Web Push Certificates
→ Generate key pair
→ Copy the Key pair (this is your VAPID public key)
```

### Generate Service Account (Backend)

```
Project Settings → Service Accounts → Generate new private key
→ Download JSON file → store as firebase-service-account.json
→ Add path to .env: FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Send Push Notification (Backend)

```typescript
import * as admin from 'firebase-admin';

await admin.messaging().send({
  token: userDeviceToken,
  notification: {
    title: '🛒 New Order!',
    body: 'You have a new order for MacBook Pro M2',
  },
  data: {
    orderId: 'CC-2024-001234',
    type: 'order',
  },
  android: { priority: 'high' },
  apns: { payload: { aps: { sound: 'default' } } },
});
```

### Register Web Push Service Worker

Create `public/firebase-messaging-sw.js`:
```javascript
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  authDomain: "chatcart-africa.firebaseapp.com",
  projectId: "chatcart-africa",
  messagingSenderId: "123456789",
  appId: "...",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
  });
});
```

### Environment Variables

```env
FIREBASE_PROJECT_ID=chatcart-africa
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chatcart-africa.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----"
FCM_VAPID_PUBLIC_KEY=BNxxxxxx...
```

---

## 6. SendGrid (Email)

Used for: Welcome emails, order receipts, OTP fallback, weekly digests.

### Setup

1. Go to **https://sendgrid.com** → Create free account (100 emails/day free)
2. Verify your sender identity:
   - **Settings → Sender Authentication**
   - Either: Single Sender Verification (quick, for testing)
   - Or: Domain Authentication (recommended for production)
3. Go to **Settings → API Keys** → Create API Key (full access)
4. Copy the API key (shown only once!)

### Domain Authentication (Production)

```
Settings → Sender Authentication → Authenticate Your Domain
→ Enter: chatcart.africa
→ Add DNS records shown to your Cloudflare DNS
→ Click Verify
```

DNS records to add:
```
CNAME  em1234.chatcart.africa   →  u1234.wl.sendgrid.net
CNAME  s1._domainkey.chatcart.africa  →  s1.domainkey.u1234.wl.sendgrid.net
CNAME  s2._domainkey.chatcart.africa  →  s2.domainkey.u1234.wl.sendgrid.net
```

### Create Email Templates

```
Email API → Dynamic Templates → Create Template
→ Add version → Design or code HTML
→ Copy Template ID (d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

Templates to create:
- `welcome` — New user welcome
- `otp` — OTP code backup (if SMS fails)
- `order_confirm` — Order confirmation
- `receipt` — Payment receipt
- `weekly_digest` — Seller performance summary

### Send Email (Backend)

```typescript
import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'buyer@example.com',
  from: { email: 'noreply@chatcart.africa', name: 'ChatCart' },
  templateId: process.env.SENDGRID_TEMPLATE_ORDER_CONFIRM,
  dynamicTemplateData: {
    buyerName: 'Alex Mukasa',
    orderNumber: 'CC-2024-001234',
    listingTitle: 'MacBook Pro M2 2022',
    amount: 'UGX 2,500,000',
  },
});
```

### Environment Variables

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@chatcart.africa
SENDGRID_FROM_NAME=ChatCart
SENDGRID_TEMPLATE_WELCOME=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_ORDER_CONFIRM=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_RECEIPT=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 7. Cloudflare R2 (File Storage + CDN)

Used for: Listing images, user avatars, store logos, documents.

### Create R2 Bucket

1. Go to **https://dash.cloudflare.com** → Your account → **R2**
2. Click **Create bucket** → name: `chatcart-media`
3. Region: **ENAM** (Eastern North America) — fastest for Africa via anycast

### Create API Token

```
R2 → Manage R2 API Tokens → Create API Token
→ Permissions: Object Read & Write
→ Specify bucket: chatcart-media
→ Create token
→ Copy: Access Key ID + Secret Access Key
```

### Connect Custom Domain

```
R2 → chatcart-media → Settings → Custom Domains
→ Connect Domain → cdn.chatcart.africa
→ Add DNS CNAME record in Cloudflare
```

### Upload from Backend (S3-compatible SDK)

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadImage(file: Buffer, key: string, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,                         // e.g. listings/lst_01/image_001.jpg
    Body: file,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

### Image Processing Pipeline

```
User uploads → NestJS receives multipart
→ Validate: type (jpg/png/webp), size (max 10MB)
→ Resize with Sharp: thumbnail (400×300), full (1200×900)
→ Convert to WebP for 60% smaller files
→ Upload both to R2
→ Store URLs in PostgreSQL
→ Return URLs to frontend
```

Install Sharp:
```bash
npm install sharp
npm install --save-dev @types/sharp
```

### Environment Variables

```env
CF_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=chatcart-media
R2_PUBLIC_URL=https://cdn.chatcart.africa
R2_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.cloudflarestorage.com
```

---

## 8. Meilisearch (Search)

Used for: Fast full-text listing search with typo tolerance and filters.

### Cloud Option (Easiest)

1. Go to **https://cloud.meilisearch.com**
2. Start a free project → 100K documents free
3. Copy the URL and Master Key

### Self-Hosted (Recommended for Production)

```bash
# Install on Ubuntu server
curl -L https://install.meilisearch.com | sh
sudo mv meilisearch /usr/local/bin/

# Configure
sudo nano /etc/meilisearch/config.toml
# master_key = "your_secure_master_key"
# env = "production"

# Start
sudo systemctl start meilisearch
```

### Create and Configure Index

```typescript
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

// Create listings index
const index = client.index('listings');

// Configure searchable attributes (order = priority)
await index.updateSearchableAttributes([
  'title',
  'description',
  'tags',
  'location.city',
  'seller.firstName',
  'store.name',
]);

// Configure filterable attributes (for filters)
await index.updateFilterableAttributes([
  'category',
  'location.city',
  'location.country',
  'price',
  'status',
  'seller.isVerified',
  'isFeatured',
  'condition',
]);

// Configure sortable attributes
await index.updateSortableAttributes([
  'price',
  'views',
  'createdAt',
  'seller.rating',
]);

// Configure typo tolerance
await index.updateSettings({
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
  },
  pagination: { maxTotalHits: 10000 },
});
```

### Index Listings

```typescript
// When creating/updating a listing:
await client.index('listings').addDocuments([
  {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    category: listing.category,
    status: listing.status,
    location: listing.location,
    seller: { firstName: listing.seller.firstName, isVerified: listing.seller.isVerified },
    isFeatured: listing.isFeatured,
    tags: listing.tags,
    createdAt: listing.createdAt,
  }
]);
```

### Search Query

```typescript
const results = await client.index('listings').search(query, {
  filter: [`category = "${category}"`, `status = "active"`, `price >= ${minPrice}`],
  sort: ['price:asc'],
  limit: 20,
  offset: 0,
  attributesToHighlight: ['title', 'description'],
});
```

### Environment Variables

```env
MEILISEARCH_HOST=https://search.chatcart.africa
MEILISEARCH_MASTER_KEY=your_meilisearch_master_key  # NEVER expose this
MEILISEARCH_SEARCH_KEY=your_public_search_key        # Safe to use in frontend
```

---

## 9. Google OAuth (Social Login)

Used for: "Sign in with Google" on web and mobile.

### Create Google Cloud Project

1. Go to **https://console.cloud.google.com**
2. Create project: `chatcart-africa`
3. **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - App name: `ChatCart`
   - Authorized domains: `chatcart.africa`
   - Scopes: `email`, `profile`, `openid`
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3001/v1/auth/google/callback` (dev)
     - `https://api.chatcart.africa/v1/auth/google/callback` (prod)
5. Copy **Client ID** and **Client Secret**

### Environment Variables

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 10. Apple Sign In

Used for: iOS App Store requirement — apps offering social login must include Apple.

### Prerequisites

- Active **Apple Developer Account** ($99/year)
- App registered with bundle ID: `africa.chatcart.app`

### Setup Steps

```
developer.apple.com
→ Certificates, Identifiers & Profiles
→ Identifiers → Register new identifier → Services IDs
→ Enable "Sign In with Apple"
→ Configure → Add your domain + return URL
```

Generate a key:
```
Keys → Register new key
→ Enable Sign In with Apple
→ Download .p8 key file (keep safe — downloaded only once!)
```

### Environment Variables

```env
APPLE_CLIENT_ID=africa.chatcart.app
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY_PATH=./AuthKey_XXXXXXXXXX.p8
```

---

## 11. WhatsApp Business API

Used for: Automated order confirmations, OTP fallback, broadcast messages.

### Apply for Access

1. Go to **https://developers.facebook.com**
2. Create a Meta Business App → **WhatsApp** product
3. Add WhatsApp number (your Uganda/Kenya business number)
4. Complete business verification (3–7 days)
5. Get **Phone Number ID** and **Permanent Access Token**

### Set Up Webhook

```
WhatsApp → Configuration → Webhook
→ Callback URL: https://api.chatcart.africa/v1/whatsapp/webhook
→ Verify token: your_random_verify_token
→ Subscribe to: messages, message_deliveries, message_reads
```

### Send Template Message (requires approval)

```bash
# Apply for message template first in Meta Business Suite
curl -X POST "https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "256700000000",
    "type": "template",
    "template": {
      "name": "order_confirmation",
      "language": { "code": "en" },
      "components": [{
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Alex" },
          { "type": "text", "text": "CC-2024-001234" }
        ]
      }]
    }
  }'
```

### Pre-filled Link (No API needed — already implemented!)

The current "Buy on WhatsApp" button uses pre-filled links — no API required:
```
https://wa.me/256700000000?text=Hello%20I%20am%20interested%20in...
```

This works immediately with zero setup. The WhatsApp Business API adds
automated replies and webhook sync on top.

### Environment Variables

```env
WA_PHONE_NUMBER_ID=1234567890123456
WA_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WA_VERIFY_TOKEN=chatcart_webhook_verify_token_2025
WA_WEBHOOK_URL=https://api.chatcart.africa/v1/whatsapp/webhook
```

---

## 12. Sentry (Error Monitoring)

Used for: Catching frontend and backend errors in production.

### Setup

1. Go to **https://sentry.io** → Create free account
2. Create two projects: `chatcart-frontend` (React) and `chatcart-backend` (Node)
3. Copy DSN for each

### Frontend Integration

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,      // 10% of transactions
  replaysSessionSampleRate: 0.01,
});
```

### Backend Integration

```bash
npm install @sentry/node @sentry/profiling-node
```

```typescript
// backend/src/main.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
```

### Environment Variables

```env
VITE_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0.ingest.sentry.io/0
SENTRY_DSN=https://yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy@o0.ingest.sentry.io/0
```

---

## Service Status Quick-Check

After configuring all services, run this checklist:

```bash
# Africa's Talking
curl "https://api.africastalking.com/version1/user?username=YOUR_USERNAME" \
  -H "apiKey: YOUR_KEY" -H "Accept: application/json"

# MTN MoMo (sandbox)
curl "https://sandbox.momodeveloper.mtn.com/collection/token/" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY" \
  -u "API_USER_ID:API_KEY"

# Stripe
curl "https://api.stripe.com/v1/balance" \
  -u "<your-stripe-secret-key>:"

# Meilisearch
curl "http://localhost:7700/health"

# Cloudflare R2 — test upload
aws s3 ls s3://chatcart-media \
  --endpoint-url https://ACCOUNT_ID.r2.cloudflarestorage.com \
  --region auto
```
