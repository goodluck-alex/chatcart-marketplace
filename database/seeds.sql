-- ============================================================
-- ChatCart — Development Seed Data
-- Run AFTER schema.sql:  psql chatcart_db < database/seeds.sql
-- ============================================================

-- ── Admin user ────────────────────────────────────────────────────────────────
INSERT INTO users (id, first_name, last_name, phone, email, role, is_verified, verification_status,
  subscription_plan, country, city, bio, total_listings, total_sales, rating, review_count, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001','Sarah','Admin','+256700000000','admin@chatcart.africa',
   'superadmin', TRUE,'verified','pro','UG','Kampala','ChatCart platform administrator',0,0,5.0,0,TRUE),

  ('00000000-0000-0000-0000-000000000002','Alex','Mukasa','+256700000001','alex@chatcart.africa',
   'seller',TRUE,'verified','starter','UG','Kampala','Electronics dealer & tech enthusiast',12,47,4.8,120,TRUE),

  ('00000000-0000-0000-0000-000000000003','Grace','Atim','+256700000002','grace@chatcart.africa',
   'buyer',TRUE,'verified','free','UG','Entebbe','Regular buyer',0,0,0,0,TRUE),

  ('00000000-0000-0000-0000-000000000004','Moses','Ouma','+254700000001','moses@chatcart.africa',
   'seller',TRUE,'verified','starter','KE','Nairobi','Real estate agent in Nairobi',8,23,4.6,58,TRUE),

  ('00000000-0000-0000-0000-000000000005','Amina','Nakato','+256700000003','amina@chatcart.africa',
   'business',TRUE,'verified','pro','UG','Kampala','AutoDeals Uganda — cars & trucks',45,189,4.9,204,TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── Stores ────────────────────────────────────────────────────────────────────
INSERT INTO stores (id, user_id, name, slug, description, whatsapp_number, address, city, country,
  categories, rating, review_count, total_listings, total_sales, is_verified, is_featured, plan)
VALUES
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
   'Trendify Store','trendify-store',
   'Premium electronics & gadgets in Uganda. Authorized Apple & Samsung reseller.',
   '256700000001','Kampala Road, Shop 14','Kampala','UG',
   ARRAY['Products','Quick Sell'],4.8,120,12,47,TRUE,TRUE,'starter'),

  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005',
   'AutoDeals Uganda','autodeals-uganda',
   'New & used vehicles — cars, trucks, motorcycles. Serving Uganda since 2015.',
   '256700000003','Industrial Area, Plot 22','Kampala','UG',
   ARRAY['Vehicles'],4.9,204,45,189,TRUE,TRUE,'pro')
ON CONFLICT (id) DO NOTHING;

-- ── Listings ──────────────────────────────────────────────────────────────────
INSERT INTO listings (id, title, slug, description, price, currency, price_type, category, condition,
  seller_id, store_id, status, attributes, location, tags, views, whatsapp_leads, is_featured, is_sponsored, thumbnail, expires_at)
VALUES
  -- Products
  ('20000000-0000-0000-0000-000000000001',
   'MacBook Pro M2 2022','macbook-pro-m2-2022',
   'MacBook Pro M2 chip, 512GB SSD, 8GB RAM. Excellent condition. Comes with original charger and box. Only 3 months old.',
   2500000,'UGX','fixed','Products','like_new',
   '00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   'active',
   '{"brand":"Apple","model":"MacBook Pro","year":2022,"storage":"512GB","ram":"8GB"}',
   '{"city":"Kampala","district":"Central","country":"UG","lat":0.3476,"lng":32.5825}',
   ARRAY['Apple','Laptop','MacBook'],712,18,TRUE,FALSE,
   'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  ('20000000-0000-0000-0000-000000000002',
   'iPhone 15 Pro Max 256GB','iphone-15-pro-max-256gb',
   'Brand new iPhone 15 Pro Max, 256GB Natural Titanium. Sealed box with 1 year Apple warranty. Invoice available.',
   4200000,'UGX','fixed','Products','new',
   '00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   'active',
   '{"brand":"Apple","model":"iPhone 15 Pro Max","storage":"256GB","color":"Natural Titanium"}',
   '{"city":"Kampala","country":"UG","lat":0.3476,"lng":32.5825}',
   ARRAY['iPhone','Apple','Premium'],987,43,TRUE,FALSE,
   'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  ('20000000-0000-0000-0000-000000000003',
   'Samsung Galaxy S24 Ultra — Sealed','samsung-galaxy-s24-ultra-sealed',
   'Brand new Samsung Galaxy S24 Ultra, 256GB. Sealed in box. All colors available. With receipt & warranty.',
   3800000,'UGX','fixed','Quick Sell','new',
   '00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   'active',
   '{"brand":"Samsung","model":"Galaxy S24 Ultra","storage":"256GB","condition":"Brand New"}',
   '{"city":"Nakawa","country":"UG"}',
   ARRAY['Samsung','Phone','Sealed'],1203,54,TRUE,TRUE,
   'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  -- Property
  ('20000000-0000-0000-0000-000000000004',
   '2 Bedroom Apartment — Kiwatule','2-bedroom-apartment-kiwatule',
   'Spacious 2-bedroom apartment in Kiwatule. Fully tiled, modern kitchen, 24hr security, parking space. Water & security included.',
   800000,'UGX','per_month','Property',NULL,
   '00000000-0000-0000-0000-000000000004',NULL,
   'active',
   '{"bedrooms":2,"bathrooms":1,"size_sqm":75,"type":"Apartment","listing_type":"For Rent","furnished":true}',
   '{"city":"Kiwatule","district":"Kampala","country":"UG"}',
   ARRAY['Apartment','Kiwatule','For Rent'],342,12,FALSE,FALSE,
   'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  ('20000000-0000-0000-0000-000000000005',
   '3 Bedroom Standalone House — Muyenga','3-bedroom-house-muyenga',
   'Elegant 3-bedroom standalone house in Muyenga. Maids quarters, garage, garden, borehole. Ready to move in.',
   350000000,'UGX','negotiable','Property',NULL,
   '00000000-0000-0000-0000-000000000004',NULL,
   'active',
   '{"bedrooms":3,"bathrooms":2,"type":"Standalone","listing_type":"For Sale","size_sqm":200}',
   '{"city":"Muyenga","district":"Kampala","country":"UG"}',
   ARRAY['House','Muyenga','For Sale'],534,18,FALSE,FALSE,
   'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  -- Vehicles
  ('20000000-0000-0000-0000-000000000006',
   'Toyota Premio 2018','toyota-premio-2018',
   '2018 Toyota Premio, 1500cc, automatic, full AC, music system, reverse camera. Clean & well maintained. Documents ready.',
   28000000,'UGX','negotiable','Vehicles','good',
   '00000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002',
   'active',
   '{"make":"Toyota","model":"Premio","year":2018,"mileage":45000,"engine":"1500cc","transmission":"Automatic"}',
   '{"city":"Kampala","country":"UG","lat":0.3476,"lng":32.5825}',
   ARRAY['Toyota','Sedan','Premio'],891,35,TRUE,TRUE,
   'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  ('20000000-0000-0000-0000-000000000007',
   'Yamaha YBR 125 Boda Boda','yamaha-ybr-125-boda',
   'Yamaha YBR 125, 2021 model. Good condition, low mileage 12,000km. Documents ready. Slightly negotiable.',
   3500000,'UGX','negotiable','Vehicles','good',
   '00000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002',
   'active',
   '{"make":"Yamaha","model":"YBR 125","year":2021,"mileage":12000,"type":"Motorcycle"}',
   '{"city":"Masaka","country":"UG"}',
   ARRAY['Motorcycle','Yamaha','Boda'],567,26,FALSE,FALSE,
   'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  -- Stays
  ('20000000-0000-0000-0000-000000000008',
   'Luxury Lake View Suite — Entebbe','luxury-lake-view-suite-entebbe',
   'Beautiful lake view suite in Entebbe. Pool, breakfast included, WiFi, AC. Perfect for couples and getaways.',
   150000,'UGX','per_night','Stays',NULL,
   '00000000-0000-0000-0000-000000000003',NULL,
   'active',
   '{"type":"Hotel","max_guests":2,"amenities":"Pool,WiFi,Breakfast,AC","check_in":"12:00 PM"}',
   '{"city":"Entebbe","country":"UG"}',
   ARRAY['Hotel','Lake View','Entebbe'],445,14,FALSE,FALSE,
   'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  -- Services
  ('20000000-0000-0000-0000-000000000009',
   'Professional Plumbing Services','professional-plumbing-kampala',
   'Licensed plumber with 10+ years experience. Available 24/7. All plumbing repairs, pipe installations, water tanks.',
   50000,'UGX','per_hour','Services',NULL,
   '00000000-0000-0000-0000-000000000003',NULL,
   'active',
   '{"service_type":"Plumbing","experience_years":10,"availability":"24/7","pricing_model":"Per Hour"}',
   '{"city":"Kampala","country":"UG"}',
   ARRAY['Plumbing','Repair','24/7'],223,29,FALSE,FALSE,
   'https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days'),

  ('20000000-0000-0000-0000-000000000010',
   'Event Photography & Videography','event-photography-kampala',
   'Professional event photography and videography. Weddings, corporate events, graduations. Full HD + 4K.',
   500000,'UGX','fixed','Services',NULL,
   '00000000-0000-0000-0000-000000000003',NULL,
   'active',
   '{"service_type":"Photography","experience_years":8,"availability":"Weekends","pricing_model":"Fixed"}',
   '{"city":"Kampala","country":"UG"}',
   ARRAY['Photography','Events','Wedding'],389,23,FALSE,FALSE,
   'https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
   NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ── Listing images ────────────────────────────────────────────────────────────
INSERT INTO listing_images (listing_id, url, thumbnail_url, sort_order, is_primary)
SELECT id, thumbnail, thumbnail, 0, TRUE FROM listings
WHERE thumbnail IS NOT NULL
ON CONFLICT DO NOTHING;

-- ── Sample reviews ────────────────────────────────────────────────────────────
INSERT INTO reviews (seller_id, reviewer_id, listing_id, rating, comment, is_verified_purchase)
VALUES
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000001',5,
   'Great seller! Item exactly as described. Fast response on WhatsApp. Will buy again!', TRUE),

  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000004',
   '20000000-0000-0000-0000-000000000002',5,
   'Very professional. iPhone was exactly as listed. Delivery was fast. Highly recommended!', TRUE),

  ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000006',4,
   'Good experience overall. Car was as described. Documents were ready. Slightly negotiated price.', TRUE)
ON CONFLICT DO NOTHING;

-- ── Sample WhatsApp leads ─────────────────────────────────────────────────────
INSERT INTO whatsapp_leads (listing_id, seller_id, buyer_phone, buyer_name, message, status)
VALUES
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
   '+256701234567','John K.',
   'Hello, I am interested in MacBook Pro M2. Is it still available?','converted'),

  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002',
   '+256702345678','Grace M.',
   'Hello, what colors do you have for the S24 Ultra?','contacted'),

  ('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000005',
   '+256703456789','David O.',
   'Is the Toyota Premio still available? Can I arrange a test drive?','new')
ON CONFLICT DO NOTHING;

-- ── Sample notifications ──────────────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, body, icon, is_read)
VALUES
  ('00000000-0000-0000-0000-000000000002','message','New WhatsApp Inquiry',
   'John K. is interested in your MacBook Pro M2 listing','💬', FALSE),

  ('00000000-0000-0000-0000-000000000002','review','New 5-Star Review!',
   'Grace Atim left you a 5-star review — "Great seller!"','⭐', FALSE),

  ('00000000-0000-0000-0000-000000000002','listing','Listing Approved',
   'Your listing "Samsung Galaxy S24 Ultra" is now live!','✅', TRUE)
ON CONFLICT DO NOTHING;

SELECT 'ChatCart seed data loaded successfully ✅' AS result;
SELECT 'Admin login — email: admin@chatcart.africa  |  phone: +256700000000' AS info;
