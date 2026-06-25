import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error'] });

  // ── Global prefix ───────────────────────────────────────────────────────────
  app.setGlobalPrefix('v1');

  // ── CORS ────────────────────────────────────────────────────────────────────
  const origins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ?? [
    'http://localhost:5173',
    'http://localhost:4173',
  ];
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // ── Validation pipe ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown fields
      forbidNonWhitelisted: true,
      transform: true,           // Auto-cast primitive types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger (dev only) ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ChatCart API')
      .setDescription('ChatCart marketplace REST API — all endpoints documented')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('auth', 'Authentication — OTP, Google, JWT refresh')
      .addTag('listings', 'Listing CRUD, search, featured')
      .addTag('users', 'User profiles, wishlist, notifications')
      .addTag('stores', 'Business store profiles')
      .addTag('orders', 'Order lifecycle and status')
      .addTag('payments', 'MTN MoMo, Airtel Money, Stripe')
      .addTag('reviews', 'Ratings and review system')
      .addTag('whatsapp', 'Lead tracking and webhook')
      .addTag('upload', 'Image upload to Cloudflare R2')
      .addTag('search', 'Meilisearch full-text search')
      .addTag('admin', 'Admin-only platform management')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`📚 Swagger docs: http://localhost:${process.env.PORT ?? 3001}/api`);
  }

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 ChatCart API running on http://localhost:${port}/v1`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV ?? 'development'}`);
}

bootstrap();
