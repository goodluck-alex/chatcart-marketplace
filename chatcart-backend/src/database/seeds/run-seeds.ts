/**
 * ChatCart Database Seeder
 * Runs: npm run seed
 * Seeds the database with admin user, sample listings, stores, reviews, and leads.
 */
import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function runSeeds() {
  console.log('🌱 Connecting to database...');
  const ds = await AppDataSource.initialize();
  console.log('✅ Connected');

  try {
    const runner = ds.createQueryRunner();

    console.log('🌱 Seeding users...');
    await runner.query(`
      INSERT INTO users (id, first_name, last_name, phone, email, role, is_verified,
        verification_status, subscription_plan, country, city, is_active)
      VALUES
        ('00000000-0000-0000-0000-000000000001','Sarah','Admin','+256700000000','admin@chatcart.africa',
         'superadmin',TRUE,'verified','pro','UG','Kampala',TRUE),
        ('00000000-0000-0000-0000-000000000002','Alex','Mukasa','+256700000001','alex@chatcart.africa',
         'seller',TRUE,'verified','starter','UG','Kampala',TRUE),
        ('00000000-0000-0000-0000-000000000003','Grace','Atim','+256700000002','grace@chatcart.africa',
         'buyer',TRUE,'verified','free','UG','Entebbe',TRUE)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('🌱 Seeding stores...');
    await runner.query(`
      INSERT INTO stores (id, user_id, name, slug, description, whatsapp_number, city, country,
        categories, is_verified, is_featured, plan)
      VALUES
        ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
         'Trendify Store','trendify-store',
         'Premium electronics & gadgets in Uganda.','256700000001',
         'Kampala','UG',ARRAY['Products','Quick Sell'],TRUE,TRUE,'starter')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('🌱 Seeding listings...');
    await runner.query(`
      INSERT INTO listings (id, title, slug, description, price, currency, price_type, category,
        condition, seller_id, store_id, status, attributes, location, tags, views, whatsapp_leads,
        is_featured, thumbnail, expires_at)
      VALUES
        ('20000000-0000-0000-0000-000000000001',
         'MacBook Pro M2 2022','macbook-pro-m2-2022',
         'MacBook Pro M2 chip, 512GB SSD, 8GB RAM. Excellent condition.',
         2500000,'UGX','fixed','Products','like_new',
         '00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
         'active',
         ${"$"}attr${"$"}{"brand":"Apple","model":"MacBook Pro","year":2022}${"$"}attr${"$"},
         ${"$"}loc${"$"}{"city":"Kampala","country":"UG"}${"$"}loc${"$"},
         ARRAY['Apple','Laptop'],712,18,TRUE,
         'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
         NOW() + INTERVAL '30 days'),

        ('20000000-0000-0000-0000-000000000002',
         'Toyota Premio 2018','toyota-premio-2018',
         '2018 Toyota Premio, 1500cc, automatic. Clean & well maintained.',
         28000000,'UGX','negotiable','Vehicles','good',
         '00000000-0000-0000-0000-000000000002',NULL,
         'active',
         ${"$"}attr2${"$"}{"make":"Toyota","model":"Premio","year":2018,"mileage":45000}${"$"}attr2${"$"},
         ${"$"}loc2${"$"}{"city":"Kampala","country":"UG"}${"$"}loc2${"$"},
         ARRAY['Toyota','Sedan'],891,35,TRUE,
         'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&h=300&w=400',
         NOW() + INTERVAL '30 days')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Seeds complete!');
    console.log('');
    console.log('Admin credentials:');
    console.log('  Phone:  +256700000000');
    console.log('  Email:  admin@chatcart.africa');
    console.log('  Role:   superadmin');
    console.log('');
    console.log('💡 Tip: Use the OTP login — check backend logs for the dev OTP code.');

    await runner.release();
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await ds.destroy();
  }
}

runSeeds();
