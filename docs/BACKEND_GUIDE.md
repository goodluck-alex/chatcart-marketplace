# ⚙️ Backend Development Guide — ChatCart (NestJS)

Complete guide to building and structuring the ChatCart NestJS backend API.

---

## Table of Contents

1. [Project Initialization](#1-project-initialization)
2. [Module Structure](#2-module-structure)
3. [Database Schema](#3-database-schema)
4. [Authentication Module](#4-authentication-module)
5. [Listings Module](#5-listings-module)
6. [Payments Module](#6-payments-module)
7. [Notifications Module](#7-notifications-module)
8. [WhatsApp Module](#8-whatsapp-module)
9. [Admin Module](#9-admin-module)
10. [API Endpoints Reference](#10-api-endpoints-reference)

---

## 1. Project Initialization

```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Create new project
nest new chatcart-api
cd chatcart-api

# Install all required packages
npm install \
  @nestjs/config \
  @nestjs/jwt \
  @nestjs/passport \
  @nestjs/throttler \
  @nestjs/typeorm \
  @nestjs/websockets \
  @nestjs/platform-socket.io \
  passport \
  passport-jwt \
  passport-google-oauth20 \
  typeorm \
  pg \
  ioredis \
  @nestjs/cache-manager \
  cache-manager-ioredis \
  meilisearch \
  @aws-sdk/client-s3 \
  @aws-sdk/lib-storage \
  multer \
  sharp \
  stripe \
  firebase-admin \
  @sendgrid/mail \
  africastalking \
  class-validator \
  class-transformer \
  bcryptjs \
  uuid \
  axios \
  date-fns

npm install --save-dev \
  @types/passport-jwt \
  @types/passport-google-oauth20 \
  @types/multer \
  @types/bcryptjs \
  @types/uuid \
  @nestjs/testing \
  supertest \
  @types/supertest
```

---

## 2. Module Structure

```
src/
├── app.module.ts                    ← Root module wires everything
├── main.ts                          ← Bootstrap with CORS, validation, Swagger
│
├── auth/                            ← Authentication
│   ├── auth.module.ts
│   ├── auth.controller.ts           ← POST /auth/otp/send, /verify, /google, /refresh
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts          ← Validates Bearer tokens
│   │   ├── jwt-refresh.strategy.ts  ← Validates refresh tokens
│   │   └── google.strategy.ts       ← Google OAuth
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts           ← @Roles('admin', 'superadmin')
│   │   └── optional-auth.guard.ts   ← Auth optional (public listings)
│   ├── decorators/
│   │   ├── roles.decorator.ts       ← @Roles(UserRole.ADMIN)
│   │   └── current-user.decorator.ts ← @CurrentUser()
│   └── dto/
│       ├── send-otp.dto.ts
│       ├── verify-otp.dto.ts
│       └── refresh-token.dto.ts
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts          ← GET /users/me, PATCH /users/me
│   ├── users.service.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── device-token.entity.ts
│   │   └── login-session.entity.ts
│   └── dto/
│       └── update-profile.dto.ts
│
├── listings/
│   ├── listings.module.ts
│   ├── listings.controller.ts       ← CRUD + search + featured
│   ├── listings.service.ts
│   ├── listings-search.service.ts   ← Meilisearch indexing
│   ├── entities/
│   │   ├── listing.entity.ts
│   │   └── listing-image.entity.ts
│   └── dto/
│       ├── create-listing.dto.ts
│       ├── update-listing.dto.ts
│       └── listing-filters.dto.ts
│
├── stores/
│   ├── stores.module.ts
│   ├── stores.controller.ts
│   ├── stores.service.ts
│   └── entities/store.entity.ts
│
├── orders/
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── entities/order.entity.ts
│
├── payments/
│   ├── payments.module.ts
│   ├── payments.controller.ts       ← POST /payments/subscribe, webhooks
│   ├── payments.service.ts
│   ├── providers/
│   │   ├── mtn-momo.provider.ts
│   │   ├── airtel-money.provider.ts
│   │   └── stripe.provider.ts
│   └── entities/
│       ├── payment.entity.ts
│       └── subscription.entity.ts
│
├── reviews/
│   ├── reviews.module.ts
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   └── entities/review.entity.ts
│
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts     ← FCM, SendGrid, Africa's Talking
│   └── entities/notification.entity.ts
│
├── whatsapp/
│   ├── whatsapp.module.ts
│   ├── whatsapp.controller.ts       ← POST /whatsapp/webhook
│   ├── whatsapp.service.ts
│   └── entities/whatsapp-lead.entity.ts
│
├── upload/
│   ├── upload.module.ts
│   ├── upload.controller.ts         ← POST /upload/image
│   └── upload.service.ts            ← Cloudflare R2, Sharp processing
│
├── search/
│   ├── search.module.ts
│   ├── search.controller.ts         ← GET /search
│   └── search.service.ts            ← Meilisearch proxy
│
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts          ← All /admin/* endpoints
│   ├── admin.service.ts
│   └── admin-guards/
│       └── admin.guard.ts           ← Requires admin/superadmin role
│
└── common/
    ├── filters/
    │   └── http-exception.filter.ts  ← Standardize error responses
    ├── interceptors/
    │   ├── response.interceptor.ts   ← Wrap all responses in { success, data }
    │   └── logging.interceptor.ts
    ├── pipes/
    │   └── validation.pipe.ts
    └── utils/
        ├── pagination.util.ts
        ├── crypto.util.ts
        └── phone.util.ts             ← Normalize phone numbers
```

---

## 3. Database Schema

### Key TypeORM Entities

```typescript
// users/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
  subscriptionPlan: SubscriptionPlan;

  @Column({ type: 'enum', enum: Country, default: Country.UG })
  country: Country;

  @Column({ nullable: true })
  city: string;

  @Column({ default: 0 })
  totalListings: number;

  @Column({ default: 0, type: 'float' })
  rating: number;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  bannedReason: string;

  @OneToOne(() => Store, store => store.user, { nullable: true })
  store: Store;

  @OneToMany(() => Listing, listing => listing.seller)
  listings: Listing[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// listings/entities/listing.entity.ts
@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.UGX })
  currency: Currency;

  @Column({ type: 'enum', enum: PriceType, default: PriceType.FIXED })
  priceType: PriceType;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @ManyToOne(() => User, user => user.listings)
  seller: User;

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, any>;    // Dynamic category-specific fields

  @Column({ type: 'jsonb', default: {} })
  location: ListingLocation;

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.PENDING_REVIEW })
  status: ListingStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  whatsappLeads: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  featuredUntil: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  expiresAt: Date;

  @OneToMany(() => ListingImage, img => img.listing, { cascade: true })
  images: ListingImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Database Migrations

```bash
# Generate a migration
npm run migration:generate -- -n CreateUsersTable

# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

---

## 4. Authentication Module

### OTP Flow

```typescript
// auth.service.ts
async sendOtp(phone: string): Promise<{ sessionId: string }> {
  // 1. Normalize phone number (+256 prefix)
  const normalizedPhone = this.normalizePhone(phone);

  // 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Store in Redis (expires in 5 minutes)
  const sessionId = uuid();
  await this.redis.setex(
    `otp:${sessionId}`,
    300,  // 5 minutes TTL
    JSON.stringify({ otp, phone: normalizedPhone, attempts: 0 })
  );

  // 4. Send SMS via Africa's Talking
  await this.africasTalking.SMS.send({
    to: normalizedPhone,
    message: `Your ChatCart verification code is: ${otp}. Valid for 5 minutes.`,
    from: process.env.AT_SENDER_ID,
  });

  return { sessionId };
}

async verifyOtp(sessionId: string, otp: string) {
  const data = await this.redis.get(`otp:${sessionId}`);
  if (!data) throw new UnauthorizedException('OTP expired or invalid');

  const { otp: storedOtp, phone, attempts } = JSON.parse(data);

  // Check max attempts
  if (attempts >= 5) {
    await this.redis.del(`otp:${sessionId}`);
    throw new UnauthorizedException('Too many attempts. Request a new OTP.');
  }

  if (storedOtp !== otp) {
    await this.redis.setex(`otp:${sessionId}`, 300,
      JSON.stringify({ otp: storedOtp, phone, attempts: attempts + 1 }));
    throw new UnauthorizedException('Invalid OTP');
  }

  // Delete OTP (single use)
  await this.redis.del(`otp:${sessionId}`);

  // Find or create user
  let user = await this.usersService.findByPhone(phone);
  const isNewUser = !user;
  if (!user) user = await this.usersService.create({ phone });

  // Issue tokens
  const tokens = await this.issueTokens(user);

  return { tokens, user, isNewUser };
}
```

### JWT Strategy

```typescript
// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; role: UserRole }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.isBanned) throw new UnauthorizedException();
    return user;
  }
}
```

---

## 5. Listings Module

### Create Listing with Images

```typescript
// listings.controller.ts
@Post()
@UseGuards(JwtAuthGuard)
@UseInterceptors(FilesInterceptor('images', 10))
async create(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: CreateListingDto,
  @CurrentUser() user: User,
) {
  // 1. Create listing record
  const listing = await this.listingsService.create(dto, user);

  // 2. Upload images to Cloudflare R2
  if (files?.length) {
    const imageUrls = await this.uploadService.uploadListingImages(listing.id, files);
    await this.listingsService.addImages(listing.id, imageUrls);
  }

  // 3. Index in Meilisearch
  await this.searchService.indexListing(listing);

  return listing;
}
```

### Listing Expiry Job (Cron)

```typescript
// Add @nestjs/schedule and run daily
@Cron('0 2 * * *')  // 2 AM daily
async expireListings() {
  const expired = await this.listingRepo.find({
    where: { status: ListingStatus.ACTIVE, expiresAt: LessThan(new Date()) }
  });

  for (const listing of expired) {
    listing.status = ListingStatus.EXPIRED;
    await this.listingRepo.save(listing);

    // Notify seller
    await this.notificationsService.send({
      userId: listing.seller.id,
      type: 'listing',
      title: 'Listing Expired',
      body: `Your listing "${listing.title}" has expired. Renew to keep it visible.`,
    });
  }
}
```

---

## 6. Payments Module

### MTN MoMo Collection

```typescript
// providers/mtn-momo.provider.ts
async requestToPay(amount: number, phone: string, reference: string) {
  const token = await this.getAccessToken();
  const externalId = uuid();

  const response = await axios.post(
    `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`,
    {
      amount: amount.toString(),
      currency: process.env.MTN_MOMO_CURRENCY,
      externalId,
      payer: { partyIdType: 'MSISDN', partyId: phone.replace('+', '') },
      payerMessage: 'ChatCart Payment',
      payeeNote: reference,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': externalId,
        'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return { referenceId: externalId, status: 'PENDING' };
}

async checkPaymentStatus(referenceId: string) {
  const token = await this.getAccessToken();
  const { data } = await axios.get(
    `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY,
      },
    }
  );
  return data.status; // SUCCESSFUL | FAILED | PENDING
}
```

---

## 7. Notifications Module

```typescript
// notifications.service.ts
async send(notification: CreateNotificationDto) {
  // 1. Save to database
  const saved = await this.notificationRepo.save({
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: notification.data,
  });

  // 2. Push via FCM
  const user = await this.usersService.findById(notification.userId);
  if (user.deviceTokens?.length) {
    await this.fcm.messaging().sendEachForMulticast({
      tokens: user.deviceTokens,
      notification: { title: notification.title, body: notification.body },
      data: notification.data ?? {},
    });
  }

  // 3. Emit via WebSocket (if connected)
  this.gateway.sendToUser(notification.userId, 'notification', saved);

  return saved;
}

async sendSms(phone: string, message: string) {
  return this.africasTalking.SMS.send({
    to: phone,
    message,
    from: process.env.AT_SENDER_ID,
  });
}

async sendEmail(to: string, templateId: string, data: Record<string, any>) {
  return this.sendgrid.send({
    to,
    from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'ChatCart' },
    templateId,
    dynamicTemplateData: data,
  });
}
```

---

## 8. WhatsApp Module

```typescript
// whatsapp.controller.ts
@Post('webhook')
async webhook(@Query('hub.mode') mode: string,
              @Query('hub.verify_token') token: string,
              @Query('hub.challenge') challenge: string,
              @Body() body: any,
              @Res() res: Response) {

  // Webhook verification (one-time setup)
  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    return res.send(challenge);
  }

  // Process incoming messages
  const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
  if (messages) {
    for (const message of messages) {
      await this.whatsappService.processIncoming(message);
    }
  }

  res.sendStatus(200);
}

// Track WhatsApp lead
@Post('leads/:listingId')
async trackLead(@Param('listingId') listingId: string, @Body() dto: TrackLeadDto) {
  await this.whatsappService.recordLead(listingId, dto.buyerPhone, dto.message);
  await this.listingsRepo.increment({ id: listingId }, 'whatsappLeads', 1);
}
```

---

## 9. Admin Module

```typescript
// admin.controller.ts — All routes require @Roles(UserRole.ADMIN)

@Get('stats')
async getStats(): Promise<PlatformStats> {
  const [totalUsers, totalListings, totalOrders, revenue] = await Promise.all([
    this.usersRepo.count(),
    this.listingsRepo.count(),
    this.ordersRepo.count(),
    this.paymentsRepo.sum('amount', { status: PaymentStatus.COMPLETED }),
  ]);

  return {
    totalUsers,
    totalListings,
    activeListings: await this.listingsRepo.count({ where: { status: ListingStatus.ACTIVE } }),
    totalOrders,
    totalRevenue: revenue ?? 0,
    // ... more stats
  };
}

@Post('listings/:id/approve')
async approveListing(@Param('id') id: string) {
  await this.listingsRepo.update(id, { status: ListingStatus.ACTIVE });
  const listing = await this.listingsRepo.findOne({ where: { id }, relations: ['seller'] });
  await this.searchService.indexListing(listing);
  await this.notificationsService.send({
    userId: listing.seller.id,
    type: 'listing',
    title: '✅ Listing Approved!',
    body: `Your listing "${listing.title}" is now live!`,
  });
}
```

---

## 10. API Endpoints Reference

### Base URL: `https://api.chatcart.africa/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/otp/send` | — | Send OTP to phone |
| POST | `/auth/otp/verify` | — | Verify OTP, return tokens |
| POST | `/auth/google` | — | Google OAuth login |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | JWT | Logout current device |
| GET | `/auth/me` | JWT | Get current user |
| GET | `/listings` | Optional | List/filter listings |
| POST | `/listings` | JWT | Create listing |
| GET | `/listings/:id` | Optional | Get listing detail |
| PATCH | `/listings/:id` | JWT | Update listing |
| DELETE | `/listings/:id` | JWT | Delete listing |
| GET | `/listings/featured` | — | Get featured listings |
| POST | `/listings/:id/view` | — | Track view |
| POST | `/listings/:id/whatsapp-click` | — | Track WA click |
| GET | `/users/me` | JWT | Get my profile |
| PATCH | `/users/me` | JWT | Update profile |
| GET | `/users/me/wishlist` | JWT | My wishlist |
| POST | `/users/me/wishlist/:id` | JWT | Add to wishlist |
| GET | `/users/me/orders` | JWT | My orders |
| GET | `/users/me/notifications` | JWT | My notifications |
| POST | `/stores` | JWT | Create store |
| GET | `/stores/:slug` | — | Public store profile |
| POST | `/orders` | JWT | Place order |
| POST | `/orders/:id/pay` | JWT | Initiate payment |
| POST | `/payments/subscribe` | JWT | Subscribe to plan |
| GET | `/payments/plans` | — | Get available plans |
| POST | `/payments/mtn/callback` | — | MTN MoMo webhook |
| POST | `/payments/airtel/callback` | — | Airtel webhook |
| POST | `/payments/stripe/webhook` | — | Stripe webhook |
| POST | `/reviews` | JWT | Submit review |
| GET | `/search` | — | Full-text search |
| POST | `/upload/image` | JWT | Upload image to R2 |
| POST | `/whatsapp/webhook` | — | WhatsApp webhook |
| GET | `/admin/stats` | Admin | Platform statistics |
| GET | `/admin/users` | Admin | List all users |
| POST | `/admin/users/:id/ban` | Admin | Ban a user |
| POST | `/admin/listings/:id/approve` | Admin | Approve listing |
| GET | `/admin/orders` | Admin | All orders |
| GET | `/health` | — | System health check |

### Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "total": 1240,
    "page": 1,
    "limit": 20,
    "totalPages": 62,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Error format:
```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401,
  "errors": {
    "phone": ["Phone number is required", "Must be a valid Uganda/Kenya/Tanzania number"]
  }
}
```

---

## main.ts Bootstrap

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('v1');

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown fields
    forbidNonWhitelisted: true,
    transform: true,           // Auto-cast types
    transformOptions: { enableImplicitConversion: true },
  }));

  // Swagger API docs (development only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ChatCart API')
      .setDescription('ChatCart marketplace API reference')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('📚 Swagger docs: http://localhost:3001/api');
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 ChatCart API running on port ${port}`);
}

bootstrap();
```
