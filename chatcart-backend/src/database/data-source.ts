// TypeORM DataSource — used by CLI for migrations and seeds
// Run: npm run migration:run

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     parseInt(process.env.DB_PORT ?? '5432'),
  database: process.env.DB_NAME     ?? 'chatcart_db',
  username: process.env.DB_USER     ?? 'chatcart_user',
  password: process.env.DB_PASS     ?? '',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities:   ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
