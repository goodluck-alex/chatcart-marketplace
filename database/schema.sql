-- ============================================================
-- ChatCart — PostgreSQL 16 Schema
-- Run: psql chatcart_db < database/schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('buyer','seller','business','admin','superadmin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('free','individual','starter','pro','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified','pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('draft','active','sold','rented','booked','suspended','pending_review','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','disputed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','completed','failed','refunded','disputed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name               VARCHAR(100),
  last_name                VARCHAR(100),
  phone                    VARCHAR(20)  NOT NULL UNIQUE,
  email                    VARCHAR(255) UNIQUE,
  avatar                   TEXT,
  role                     user_role    NOT NULL DEFAULT 'buyer',
  is_verified              BOOLEAN      NOT NULL DEFAULT FALSE,
  verification_status      verification_status NOT NULL DEFAULT 'unverified',
  subscription_plan        subscription_plan   NOT NULL DEFAULT 'free',
  subscription_expires_at  TIMESTAMPTZ,
  country                  VARCHAR(5)   NOT NULL DEFAULT 'UG',
  city                     VARCHAR(100),
  bio                      TEXT,
  total_listings           INT          NOT NULL DEFAULT 0,
  total_sales              INT          NOT NULL DEFAULT 0,
  rating                   NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count             INT          NOT NULL DEFAULT 0,
  is_active                BOOLEAN      NOT NULL DEFAULT TRUE,
  is_banned                BOOLEAN      NOT NULL DEFAULT FALSE,
  banned_reason            TEXT,
  device_tokens            TEXT[],
  last_seen_at             TIMESTAMPTZ  DEFAULT NOW(),
  joined_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone   ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_email   ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role    ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_plan    ON users (subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_country ON users (country);

-- ============================================================
-- LOGIN SESSIONS (refresh tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS login_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token  TEXT        NOT NULL UNIQUE,
  device_name    VARCHAR(200),
  platform       VARCHAR(50),
  ip_address     VARCHAR(50),
  city           VARCHAR(100),
  country        VARCHAR(10),
  is_revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at     TIMESTAMPTZ NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON login_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token   ON login_sessions (refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON login_sessions (expires_at);

-- ============================================================
-- STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  logo            TEXT,
  cover_image     TEXT,
  whatsapp_number VARCHAR(20)  NOT NULL,
  website         VARCHAR(500),
  address         TEXT,
  city            VARCHAR(100),
  country         VARCHAR(5)  NOT NULL DEFAULT 'UG',
  categories      TEXT[],
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count    INT          NOT NULL DEFAULT 0,
  total_listings  INT          NOT NULL DEFAULT 0,
  total_sales     INT          NOT NULL DEFAULT 0,
  is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN      NOT NULL DEFAULT FALSE,
  plan            VARCHAR(20)  NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  followers_count INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_slug     ON stores (slug);
CREATE INDEX IF NOT EXISTS idx_stores_country  ON stores (country);
CREATE INDEX IF NOT EXISTS idx_stores_featured ON stores (is_featured);

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(300)    NOT NULL,
  slug            VARCHAR(300)    NOT NULL UNIQUE,
  description     TEXT            NOT NULL,
  price           NUMERIC(15,2)   NOT NULL,
  currency        VARCHAR(5)      NOT NULL DEFAULT 'UGX',
  price_type      VARCHAR(20)     NOT NULL DEFAULT 'fixed',
  category        VARCHAR(50)     NOT NULL,
  sub_category    VARCHAR(100),
  condition       VARCHAR(20),
  seller_id       UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id        UUID            REFERENCES stores(id) ON DELETE SET NULL,
  status          listing_status  NOT NULL DEFAULT 'pending_review',
  attributes      JSONB           NOT NULL DEFAULT '{}',
  location        JSONB           NOT NULL DEFAULT '{}',
  tags            TEXT[],
  views           INT             NOT NULL DEFAULT 0,
  wishlist_count  INT             NOT NULL DEFAULT 0,
  inquiry_count   INT             NOT NULL DEFAULT 0,
  whatsapp_leads  INT             NOT NULL DEFAULT 0,
  is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,
  is_sponsored    BOOLEAN         NOT NULL DEFAULT FALSE,
  featured_until  TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  thumbnail       TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_category   ON listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_status     ON listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_seller     ON listings (seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_store      ON listings (store_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured   ON listings (is_featured, featured_until);
CREATE INDEX IF NOT EXISTS idx_listings_price      ON listings (price);
CREATE INDEX IF NOT EXISTS idx_listings_created    ON listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_views      ON listings (views DESC);
CREATE INDEX IF NOT EXISTS idx_listings_location   ON listings USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_listings_attrs      ON listings USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_listings_fts        ON listings
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================
-- LISTING IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url           TEXT        NOT NULL,
  thumbnail_url TEXT        NOT NULL,
  cdn_key       TEXT,
  alt_text      VARCHAR(300),
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  is_primary    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_listing ON listing_images (listing_id, sort_order);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100001;

CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      VARCHAR(30)   NOT NULL UNIQUE DEFAULT 'CC-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || NEXTVAL('order_number_seq')::TEXT,
  listing_id        UUID          NOT NULL REFERENCES listings(id),
  buyer_id          UUID          NOT NULL REFERENCES users(id),
  seller_id         UUID          NOT NULL REFERENCES users(id),
  quantity          INT           NOT NULL DEFAULT 1,
  total_amount      NUMERIC(15,2) NOT NULL,
  currency          VARCHAR(5)    NOT NULL DEFAULT 'UGX',
  status            order_status  NOT NULL DEFAULT 'pending',
  payment_status    payment_status NOT NULL DEFAULT 'pending',
  payment_method    VARCHAR(30),
  payment_reference VARCHAR(200),
  delivery_address  JSONB,
  notes             TEXT,
  dispute_reason    TEXT,
  completed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer   ON orders (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller  ON orders (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders (payment_status);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID          REFERENCES orders(id) ON DELETE SET NULL,
  user_id      UUID          NOT NULL REFERENCES users(id),
  amount       NUMERIC(15,2) NOT NULL,
  currency     VARCHAR(5)    NOT NULL DEFAULT 'UGX',
  method       VARCHAR(30)   NOT NULL,
  status       VARCHAR(20)   NOT NULL DEFAULT 'pending',
  reference    VARCHAR(200)  UNIQUE,
  provider_data JSONB,
  description  TEXT,
  type         VARCHAR(30)   NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user      ON payments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order     ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments (reference);
CREATE INDEX IF NOT EXISTS idx_payments_status    ON payments (status);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id           UUID         REFERENCES listings(id) ON DELETE SET NULL,
  seller_id            UUID         NOT NULL REFERENCES users(id),
  reviewer_id          UUID         NOT NULL REFERENCES users(id),
  order_id             UUID         REFERENCES orders(id) ON DELETE SET NULL,
  rating               SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment              TEXT,
  is_verified_purchase BOOLEAN      NOT NULL DEFAULT FALSE,
  reply                TEXT,
  replied_at           TIMESTAMPTZ,
  is_hidden            BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller   ON reviews (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_listing  ON reviews (listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews (reviewer_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT        NOT NULL,
  data       JSONB,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  icon       VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user   ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifs_unread ON notifications (user_id) WHERE is_read = FALSE;

-- ============================================================
-- WHATSAPP LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id    UUID        NOT NULL REFERENCES users(id),
  buyer_phone  VARCHAR(20) NOT NULL,
  buyer_name   VARCHAR(200),
  message      TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'new',
  converted_at TIMESTAMPTZ,
  order_id     UUID        REFERENCES orders(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_leads_seller  ON whatsapp_leads (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_leads_listing ON whatsapp_leads (listing_id);
CREATE INDEX IF NOT EXISTS idx_wa_leads_status  ON whatsapp_leads (status);

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items (user_id, created_at DESC);

-- ============================================================
-- updated_at auto-trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['users','stores','listings','orders','payments','whatsapp_leads'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;

SELECT 'ChatCart schema loaded successfully ✅' AS result;
