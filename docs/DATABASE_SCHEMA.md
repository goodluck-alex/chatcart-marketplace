# 🗄 Database Schema — ChatCart (PostgreSQL)

Complete PostgreSQL database schema with all tables, relationships, indexes, and migration strategy.

---

## Entity Relationship Overview

```
users ──────────────────────────────────────┐
  │                                         │
  ├── stores (one-to-one)                   │
  │     └── listings (one-to-many) ─────────┤
  │                                         │
  ├── listings (one-to-many as seller)      │
  │     ├── listing_images (one-to-many)    │
  │     ├── reviews (one-to-many)           │
  │     └── whatsapp_leads (one-to-many)    │
  │                                         │
  ├── orders (one-to-many as buyer)         │
  │     └── payments (one-to-many)          │
  │                                         │
  ├── orders (one-to-many as seller)        │
  ├── reviews (one-to-many as reviewer)     │
  ├── notifications (one-to-many)           │
  ├── device_tokens (one-to-many)           │
  ├── login_sessions (one-to-many)          │
  ├── subscriptions (one-to-one)            │
  └── wishlist_items (many-to-many → listings)
```

---

## Tables

### 1. `users`

```sql
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name            VARCHAR(100),
  last_name             VARCHAR(100),
  phone                 VARCHAR(20) UNIQUE NOT NULL,
  email                 VARCHAR(255) UNIQUE,
  avatar                TEXT,
  role                  VARCHAR(20) NOT NULL DEFAULT 'buyer'
                          CHECK (role IN ('buyer','seller','business','admin','superadmin')),
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status   VARCHAR(20) NOT NULL DEFAULT 'unverified'
                          CHECK (verification_status IN ('unverified','pending','verified','rejected')),
  subscription_plan     VARCHAR(20) NOT NULL DEFAULT 'free'
                          CHECK (subscription_plan IN ('free','individual','starter','pro','enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  country               VARCHAR(5) NOT NULL DEFAULT 'UG'
                          CHECK (country IN ('UG','KE','TZ')),
  city                  VARCHAR(100),
  bio                   TEXT,
  total_listings        INTEGER NOT NULL DEFAULT 0,
  total_sales           INTEGER NOT NULL DEFAULT 0,
  rating                DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count          INTEGER NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_banned             BOOLEAN NOT NULL DEFAULT FALSE,
  banned_reason         TEXT,
  banned_at             TIMESTAMPTZ,
  banned_by             UUID REFERENCES users(id),
  last_seen_at          TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone    ON users(phone);
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_country  ON users(country);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_plan     ON users(subscription_plan);
```

---

### 2. `stores`

```sql
CREATE TABLE stores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  logo            TEXT,
  cover_image     TEXT,
  whatsapp_number VARCHAR(20) NOT NULL,
  website         VARCHAR(500),
  address         TEXT,
  city            VARCHAR(100),
  country         VARCHAR(5) NOT NULL DEFAULT 'UG',
  categories      TEXT[] NOT NULL DEFAULT '{}',
  rating          DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  total_listings  INTEGER NOT NULL DEFAULT 0,
  total_sales     INTEGER NOT NULL DEFAULT 0,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  plan            VARCHAR(20) NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  followers_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_slug     ON stores(slug);
CREATE INDEX idx_stores_country  ON stores(country);
CREATE INDEX idx_stores_featured ON stores(is_featured);
```

---

### 3. `listings`

```sql
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(300) NOT NULL,
  slug            VARCHAR(300) NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  price           DECIMAL(15,2) NOT NULL,
  currency        VARCHAR(5) NOT NULL DEFAULT 'UGX'
                    CHECK (currency IN ('UGX','KES','TZS','USD')),
  price_type      VARCHAR(20) NOT NULL DEFAULT 'fixed'
                    CHECK (price_type IN ('fixed','negotiable','per_night','per_month','per_hour','free')),
  category        VARCHAR(50) NOT NULL
                    CHECK (category IN ('Products','Property','Vehicles','Stays','Services','Quick Sell')),
  sub_category    VARCHAR(100),
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id        UUID REFERENCES stores(id) ON DELETE SET NULL,
  status          VARCHAR(30) NOT NULL DEFAULT 'pending_review'
                    CHECK (status IN ('draft','active','sold','rented','booked','suspended','pending_review','expired')),
  condition       VARCHAR(20)
                    CHECK (condition IN ('new','like_new','good','fair','poor')),
  attributes      JSONB NOT NULL DEFAULT '{}',    -- Dynamic fields per category
  location        JSONB NOT NULL DEFAULT '{}',    -- {city, district, country, lat, lng}
  tags            TEXT[] DEFAULT '{}',
  views           INTEGER NOT NULL DEFAULT 0,
  wishlist_count  INTEGER NOT NULL DEFAULT 0,
  inquiry_count   INTEGER NOT NULL DEFAULT 0,
  whatsapp_leads  INTEGER NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_sponsored    BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until  TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  approved_at     TIMESTAMPTZ,
  approved_by     UUID REFERENCES users(id),
  rejected_at     TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_listings_category    ON listings(category);
CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_seller      ON listings(seller_id);
CREATE INDEX idx_listings_store       ON listings(store_id);
CREATE INDEX idx_listings_featured    ON listings(is_featured, featured_until);
CREATE INDEX idx_listings_expires     ON listings(expires_at);
CREATE INDEX idx_listings_price       ON listings(price, currency);
CREATE INDEX idx_listings_created     ON listings(created_at DESC);
CREATE INDEX idx_listings_views       ON listings(views DESC);

-- Full-text search (PostgreSQL native — Meilisearch is primary search)
CREATE INDEX idx_listings_fts ON listings
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- GeoJSON location search
CREATE INDEX idx_listings_location ON listings USING GIN(location);

-- JSON attributes for category-specific filters
CREATE INDEX idx_listings_attributes ON listings USING GIN(attributes);
```

---

### 4. `listing_images`

```sql
CREATE TABLE listing_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  cdn_key       TEXT NOT NULL,          -- Cloudflare R2 object key
  alt_text      VARCHAR(300),
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  size_bytes    INTEGER,
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id, sort_order);
```

---

### 5. `orders`

```sql
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        VARCHAR(30) NOT NULL UNIQUE,
  listing_id          UUID NOT NULL REFERENCES listings(id),
  buyer_id            UUID NOT NULL REFERENCES users(id),
  seller_id           UUID NOT NULL REFERENCES users(id),
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price          DECIMAL(15,2) NOT NULL,
  total_amount        DECIMAL(15,2) NOT NULL,
  platform_fee        DECIMAL(15,2) NOT NULL DEFAULT 0,
  seller_amount       DECIMAL(15,2) NOT NULL,
  currency            VARCHAR(5) NOT NULL DEFAULT 'UGX',
  status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled','disputed','refunded')),
  payment_status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending','completed','failed','refunded','disputed')),
  payment_method      VARCHAR(30)
                        CHECK (payment_method IN ('mtn_momo','airtel_money','stripe','cash','escrow')),
  payment_reference   VARCHAR(200),
  delivery_address    JSONB,
  notes               TEXT,
  dispute_reason      TEXT,
  resolution          TEXT,
  whatsapp_thread_id  VARCHAR(200),
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancelled_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer    ON orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller   ON orders(seller_id, created_at DESC);
CREATE INDEX idx_orders_status   ON orders(status);
CREATE INDEX idx_orders_number   ON orders(order_number);
CREATE INDEX idx_orders_payment  ON orders(payment_status);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'CC-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 100000;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();
```

---

### 6. `payments`

```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES users(id),
  amount          DECIMAL(15,2) NOT NULL,
  currency        VARCHAR(5) NOT NULL,
  method          VARCHAR(30) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  reference       VARCHAR(200) UNIQUE,    -- Provider transaction ID
  provider_data   JSONB,                  -- Raw provider response
  description     TEXT,
  type            VARCHAR(30) NOT NULL    -- 'order' | 'subscription' | 'listing_fee' | 'boost'
                    CHECK (type IN ('order','subscription','listing_fee','boost','refund')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user      ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_order     ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status    ON payments(status);
```

---

### 7. `subscriptions`

```sql
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan            VARCHAR(20) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'trial'
                    CHECK (status IN ('active','trial','cancelled','expired','past_due')),
  price           DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(5) NOT NULL DEFAULT 'UGX',
  billing_cycle   VARCHAR(10) NOT NULL DEFAULT 'monthly',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at   TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end   TIMESTAMPTZ NOT NULL,
  cancelled_at    TIMESTAMPTZ,
  auto_renew      BOOLEAN NOT NULL DEFAULT TRUE,
  payment_method  VARCHAR(30),
  stripe_subscription_id VARCHAR(200),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 8. `reviews`

```sql
CREATE TABLE reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id            UUID REFERENCES listings(id) ON DELETE SET NULL,
  seller_id             UUID NOT NULL REFERENCES users(id),
  reviewer_id           UUID NOT NULL REFERENCES users(id),
  order_id              UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating                SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment               TEXT,
  is_verified_purchase  BOOLEAN NOT NULL DEFAULT FALSE,
  reply                 TEXT,
  replied_at            TIMESTAMPTZ,
  is_hidden             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)    -- One review per order
);

CREATE INDEX idx_reviews_seller   ON reviews(seller_id, created_at DESC);
CREATE INDEX idx_reviews_listing  ON reviews(listing_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
```

---

### 9. `notifications`

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL
                CHECK (type IN ('message','order','listing','system','promo','review','wishlist')),
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  icon        VARCHAR(10),
  action_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifs_user    ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifs_unread  ON notifications(user_id) WHERE is_read = FALSE;
```

---

### 10. `whatsapp_leads`

```sql
CREATE TABLE whatsapp_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES users(id),
  buyer_phone   VARCHAR(20) NOT NULL,
  buyer_name    VARCHAR(200),
  message       TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','converted','lost')),
  converted_at  TIMESTAMPTZ,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_leads_listing ON whatsapp_leads(listing_id, created_at DESC);
CREATE INDEX idx_wa_leads_seller  ON whatsapp_leads(seller_id);
CREATE INDEX idx_wa_leads_status  ON whatsapp_leads(status);
```

---

### 11. `wishlist_items`

```sql
CREATE TABLE wishlist_items (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id, created_at DESC);
```

---

### 12. `login_sessions`

```sql
CREATE TABLE login_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(500) NOT NULL UNIQUE,
  device_name     VARCHAR(200),
  platform        VARCHAR(50),           -- web | android | ios
  user_agent      TEXT,
  ip_address      INET,
  city            VARCHAR(100),
  country         VARCHAR(5),
  is_revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user    ON login_sessions(user_id);
CREATE INDEX idx_sessions_token   ON login_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON login_sessions(expires_at);

-- Cleanup expired sessions (run via cron)
-- DELETE FROM login_sessions WHERE expires_at < NOW() OR is_revoked = TRUE;
```

---

### 13. `reports`

```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES users(id),
  target_type     VARCHAR(20) NOT NULL CHECK (target_type IN ('listing','user','review')),
  target_id       UUID NOT NULL,
  reason          VARCHAR(100) NOT NULL,
  description     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','resolved','dismissed')),
  resolved_by     UUID REFERENCES users(id),
  resolution      TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
```

---

### 14. `otp_sessions` (Redis — not PostgreSQL)

OTPs are stored in Redis with TTL, not PostgreSQL:

```
Key:   otp:{sessionId}
Value: JSON { "otp": "123456", "phone": "+256700000000", "attempts": 0 }
TTL:   300 seconds (5 minutes)
```

---

## Database Maintenance

### Useful Queries

```sql
-- Active listings by category
SELECT category, COUNT(*) as count, AVG(price) as avg_price
FROM listings WHERE status = 'active'
GROUP BY category ORDER BY count DESC;

-- Top sellers by revenue
SELECT u.first_name, u.last_name,
       COUNT(o.id) as orders,
       SUM(o.seller_amount) as revenue
FROM users u
JOIN orders o ON o.seller_id = u.id
WHERE o.status = 'completed'
GROUP BY u.id ORDER BY revenue DESC LIMIT 20;

-- WhatsApp conversion rate by category
SELECT l.category,
       COUNT(wl.id) as leads,
       COUNT(o.id) as orders,
       ROUND(COUNT(o.id)::numeric / NULLIF(COUNT(wl.id), 0) * 100, 2) as conversion_pct
FROM listings l
LEFT JOIN whatsapp_leads wl ON wl.listing_id = l.id
LEFT JOIN orders o ON o.id = wl.order_id
GROUP BY l.category;

-- Listings expiring in next 7 days
SELECT id, title, seller_id, expires_at
FROM listings
WHERE status = 'active'
  AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY expires_at;
```

### Regular Maintenance Jobs (Cron)

```sql
-- Run daily at 2 AM (via backend cron service)

-- 1. Expire old listings
UPDATE listings
SET status = 'expired', updated_at = NOW()
WHERE status = 'active' AND expires_at < NOW();

-- 2. Deactivate expired featured listings
UPDATE listings
SET is_featured = FALSE, updated_at = NOW()
WHERE is_featured = TRUE AND featured_until < NOW();

-- 3. Expire subscriptions
UPDATE subscriptions
SET status = 'expired', updated_at = NOW()
WHERE status = 'active' AND current_period_end < NOW();

-- 4. Downgrade expired subscription users
UPDATE users u
SET subscription_plan = 'free', updated_at = NOW()
FROM subscriptions s
WHERE s.user_id = u.id AND s.status = 'expired' AND u.subscription_plan != 'free';

-- 5. Clean expired sessions
DELETE FROM login_sessions
WHERE expires_at < NOW() OR is_revoked = TRUE;

-- 6. Clean old OTP sessions in Redis
-- (Handled automatically via TTL — no SQL needed)
```
