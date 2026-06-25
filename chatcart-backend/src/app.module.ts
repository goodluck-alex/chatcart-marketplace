import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Feature modules
import { AuthModule }          from './auth/auth.module';
import { UsersModule }         from './users/users.module';
import { ListingsModule }      from './listings/listings.module';
import { StoresModule }        from './stores/stores.module';
import { OrdersModule }        from './orders/orders.module';
import { PaymentsModule }      from './payments/payments.module';
import { ReviewsModule }       from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WhatsappModule }      from './whatsapp/whatsapp.module';
import { UploadModule }        from './upload/upload.module';
import { SearchModule }        from './search/search.module';
import { AdminModule }         from './admin/admin.module';
import { HealthModule }        from './health/health.module';

@Module({
  imports: [
    // ── Config (.env loading) ──────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── PostgreSQL (TypeORM) ───────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        database: cfg.get('DB_NAME', 'chatcart_db'),
        username: cfg.get('DB_USER', 'chatcart_user'),
        password: cfg.get('DB_PASS', ''),
        ssl: cfg.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        // Auto-load all entities from feature modules
        autoLoadEntities: true,
        // NEVER use synchronize:true in production — use migrations
        synchronize: cfg.get('NODE_ENV') === 'development',
        logging: cfg.get('NODE_ENV') === 'development',
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: false,
      }),
    }),

    // ── Rate limiting ──────────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  }, // 10 req/sec
      { name: 'medium', ttl: 10000, limit: 50  }, // 50 req/10sec
      { name: 'long',   ttl: 60000, limit: 200 }, // 200 req/min
    ]),

    // ── Cron jobs ──────────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Feature modules ───────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ListingsModule,
    StoresModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    WhatsappModule,
    UploadModule,
    SearchModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
