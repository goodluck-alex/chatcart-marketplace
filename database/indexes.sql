-- ============================================================
-- ChatCart — Additional Performance Indexes
-- Run after schema.sql for production optimization
-- ============================================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_cat_status_price
  ON listings (category, status, price)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_featured_active
  ON listings (is_featured, created_at DESC)
  WHERE status = 'active' AND is_featured = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_city_active
  ON listings ((location->>'city'), status)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_status
  ON orders (buyer_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller_status
  ON orders (seller_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_completed
  ON payments (user_id, created_at DESC)
  WHERE status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifs_unread_user
  ON notifications (user_id, created_at DESC)
  WHERE is_read = FALSE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wa_leads_new
  ON whatsapp_leads (seller_id, created_at DESC)
  WHERE status = 'new';

-- Trigram indexes for fuzzy search (requires pg_trgm extension)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_title_trgm
  ON listings USING GIN (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_name_trgm
  ON users USING GIN ((first_name || ' ' || COALESCE(last_name,'')) gin_trgm_ops);

SELECT 'ChatCart indexes created ✅' AS result;
