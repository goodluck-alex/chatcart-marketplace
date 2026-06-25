// ─── Core Domain Types ─────────────────────────────────────────────────────────

export type UserRole = "buyer" | "seller" | "business" | "admin" | "superadmin";
export type ListingStatus = "draft" | "active" | "sold" | "rented" | "booked" | "suspended" | "pending_review";
export type SubscriptionPlan = "free" | "individual" | "starter" | "pro" | "enterprise";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "disputed";
export type OrderStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "disputed";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type Category = "Products" | "Property" | "Vehicles" | "Stays" | "Services" | "Quick Sell";
export type Currency = "UGX" | "KES" | "TZS" | "USD";
export type Country = "UG" | "KE" | "TZ";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string;
  country: Country;
  city: string;
  bio?: string;
  totalListings: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  joinedAt: string;
  lastSeenAt: string;
  deviceTokens: string[];
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string;
  store?: Store;
  // Auth
  accessToken?: string;
  refreshToken?: string;
}

// ─── Store / Business Profile ─────────────────────────────────────────────────
export interface Store {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  whatsappNumber: string;
  website?: string;
  address: string;
  city: string;
  country: Country;
  categories: Category[];
  rating: number;
  reviewCount: number;
  totalListings: number;
  totalSales: number;
  isVerified: boolean;
  isFeatured: boolean;
  plan: SubscriptionPlan;
  planExpiresAt?: string;
  followers: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Listing ──────────────────────────────────────────────────────────────────
export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: Currency;
  priceType: "fixed" | "negotiable" | "per_night" | "per_month" | "per_hour" | "free";
  category: Category;
  subCategory?: string;
  images: ListingImage[];
  thumbnail?: string;
  location: ListingLocation;
  seller: User;
  store?: Store;
  status: ListingStatus;
  condition?: "new" | "like_new" | "good" | "fair" | "poor";
  attributes: Record<string, string | number | boolean>;
  tags: string[];
  views: number;
  wishlistCount: number;
  inquiryCount: number;
  whatsappLeads: number;
  isFeatured: boolean;
  isSponsored: boolean;
  featuredUntil?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Computed
  isWishlisted?: boolean;
  distanceKm?: number;
}

export interface ListingImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  order: number;
  altText?: string;
}

export interface ListingLocation {
  city: string;
  district?: string;
  country: Country;
  lat?: number;
  lng?: number;
  displayAddress?: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  listingId?: string;
  sellerId: string;
  reviewer: User;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  orderNumber: string;
  listing: Listing;
  buyer: User;
  seller: User;
  quantity: number;
  totalAmount: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "mtn_momo" | "airtel_money" | "stripe" | "cash";
  paymentReference?: string;
  deliveryAddress?: string;
  notes?: string;
  whatsappThreadId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "cancelled" | "expired" | "trial";
  price: number;
  currency: Currency;
  billingCycle: "monthly" | "yearly";
  startedAt: string;
  expiresAt: string;
  paymentMethod: string;
  autoRenew: boolean;
  features: SubscriptionFeature[];
}

export interface SubscriptionFeature {
  key: string;
  label: string;
  value: string | number | boolean;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: "message" | "order" | "listing" | "system" | "promo" | "review" | "wishlist";
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  icon?: string;
}

// ─── WhatsApp Lead ────────────────────────────────────────────────────────────
export interface WhatsAppLead {
  id: string;
  listingId: string;
  listing: Listing;
  buyerPhone: string;
  buyerName?: string;
  message: string;
  status: "new" | "contacted" | "converted" | "lost";
  createdAt: string;
  convertedAt?: string;
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────
export interface PlatformStats {
  totalUsers: number;
  totalSellers: number;
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  totalRevenue: number;
  totalWhatsAppLeads: number;
  conversionRate: number;
  newUsersToday: number;
  newListingsToday: number;
  revenueToday: number;
  ordersToday: number;
  // Trends (last 30 days)
  userGrowth: number;
  listingGrowth: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  subscriptions: number;
  featuredListings: number;
}

export interface CategoryBreakdown {
  category: Category;
  count: number;
  percentage: number;
  revenue: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  phone?: string;
  email?: string;
  otp?: string;
  googleToken?: string;
  appleToken?: string;
}

export interface OtpRequest {
  phone: string;
  purpose: "login" | "register" | "verify";
}

// ─── Filter / Search ─────────────────────────────────────────────────────────
export interface ListingFilters {
  query?: string;
  category?: Category;
  subCategory?: string;
  country?: Country;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  condition?: string;
  sellerVerified?: boolean;
  isFeatured?: boolean;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc" | "rating" | "popular" | "distance";
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  status?: ListingStatus;
}

export interface AdminUserFilters {
  query?: string;
  role?: UserRole;
  plan?: SubscriptionPlan;
  isVerified?: boolean;
  isBanned?: boolean;
  country?: Country;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "most_listings" | "revenue";
}
