// ─── ChatCart API Client ───────────────────────────────────────────────────────
// Wraps all backend REST endpoints with typed methods.
// Base: NestJS backend at VITE_API_BASE_URL
// Auth: JWT Bearer tokens stored in localStorage, auto-refreshed on 401.

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { config } from "./config";
import type {
  ApiResponse,
  PaginatedResponse,
  AuthTokens,
  OtpRequest,
  User,
  Listing,
  ListingFilters,
  Store,
  Order,
  Review,
  Notification,
  PlatformStats,
  RevenueDataPoint,
  CategoryBreakdown,
  WhatsAppLead,
  Subscription,
  AdminUserFilters,
} from "./types";

// ─── Token storage helpers ────────────────────────────────────────────────────
const TOKEN_KEY = "cc_access_token";
const REFRESH_KEY = "cc_refresh_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const http: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor – attach Bearer token
http.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token && req.headers) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response interceptor – auto-refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

http.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          refreshQueue.push((token: string) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`;
            resolve(http(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = tokenStorage.getRefresh();
        const { data } = await axios.post<ApiResponse<AuthTokens>>(
          `${config.apiBaseUrl}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefresh } = data.data;
        tokenStorage.set(accessToken, newRefresh);
        refreshQueue.forEach(cb => cb(accessToken));
        refreshQueue = [];
        if (original.headers) original.headers.Authorization = `Bearer ${accessToken}`;
        return http(original);
      } catch {
        tokenStorage.clear();
        window.dispatchEvent(new CustomEvent("cc:logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (data: OtpRequest) =>
    http.post<ApiResponse<{ sessionId: string }>>("/auth/otp/send", data),

  verifyOtp: (sessionId: string, otp: string) =>
    http.post<ApiResponse<{ tokens: AuthTokens; user: User; isNewUser: boolean }>>(
      "/auth/otp/verify", { sessionId, otp }
    ),

  loginGoogle: (idToken: string) =>
    http.post<ApiResponse<{ tokens: AuthTokens; user: User }>>("/auth/google", { idToken }),

  loginApple: (identityToken: string) =>
    http.post<ApiResponse<{ tokens: AuthTokens; user: User }>>("/auth/apple", { identityToken }),

  loginEmail: (email: string, password: string) =>
    http.post<ApiResponse<{ tokens: AuthTokens; user: User }>>("/auth/email", { email, password }),

  refresh: (refreshToken: string) =>
    http.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken }),

  logout: () => http.post("/auth/logout"),

  me: () => http.get<ApiResponse<User>>("/auth/me"),
};

// ─── Listings API ─────────────────────────────────────────────────────────────
export const listingsApi = {
  getAll: (filters: ListingFilters = {}) =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>("/listings", { params: filters }),

  getById: (id: string) =>
    http.get<ApiResponse<Listing>>(`/listings/${id}`),

  getBySlug: (slug: string) =>
    http.get<ApiResponse<Listing>>(`/listings/slug/${slug}`),

  create: (data: FormData) =>
    http.post<ApiResponse<Listing>>("/listings", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    http.patch<ApiResponse<Listing>>(`/listings/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) =>
    http.delete<ApiResponse<void>>(`/listings/${id}`),

  getFeatured: (limit = 8) =>
    http.get<ApiResponse<Listing[]>>("/listings/featured", { params: { limit } }),

  getNearby: (lat: number, lng: number, radiusKm = 20, limit = 12) =>
    http.get<ApiResponse<Listing[]>>("/listings/nearby", {
      params: { lat, lng, radiusKm, limit },
    }),

  getRecommendations: (filters: { city?: string; category?: string; query?: string; limit?: number } = {}) =>
    http.get<ApiResponse<Listing[]>>("/listings/recommendations", {
      params: filters,
    }),

  incrementView: (id: string) =>
    http.post<ApiResponse<void>>(`/listings/${id}/view`),

  trackWhatsAppClick: (id: string) =>
    http.post<ApiResponse<void>>(`/listings/${id}/whatsapp-click`),

  search: (query: string, filters: Omit<ListingFilters, "query"> = {}) =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>("/listings/search", {
      params: { query, ...filters },
    }),

  uploadImages: (listingId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("images", f));
    return http.post<ApiResponse<string[]>>(`/listings/${listingId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (listingId: string, imageId: string) =>
    http.delete<ApiResponse<void>>(`/listings/${listingId}/images/${imageId}`),

  featureListing: (id: string, days: number, paymentMethod: string) =>
    http.post<ApiResponse<Listing>>(`/listings/${id}/feature`, { days, paymentMethod }),

  getMyListings: (filters: ListingFilters = {}) =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>("/listings/mine", { params: filters }),

  getWhatsAppLeads: (listingId: string) =>
    http.get<ApiResponse<WhatsAppLead[]>>(`/listings/${listingId}/leads`),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: (userId: string) =>
    http.get<ApiResponse<User>>(`/users/${userId}`),

  updateProfile: (data: Partial<User> | FormData) =>
    http.patch<ApiResponse<User>>("/users/me", data instanceof FormData ? data : JSON.stringify(data), {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return http.post<ApiResponse<{ url: string }>>("/users/me/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getWishlist: () =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>("/users/me/wishlist"),

  addToWishlist: (listingId: string) =>
    http.post<ApiResponse<void>>(`/users/me/wishlist/${listingId}`),

  removeFromWishlist: (listingId: string) =>
    http.delete<ApiResponse<void>>(`/users/me/wishlist/${listingId}`),

  getOrders: (status?: string) =>
    http.get<ApiResponse<PaginatedResponse<Order>>>("/users/me/orders", {
      params: { status },
    }),

  getNotifications: (page = 1) =>
    http.get<ApiResponse<PaginatedResponse<Notification>>>("/users/me/notifications", {
      params: { page, limit: 20 },
    }),

  markNotificationRead: (id: string) =>
    http.patch<ApiResponse<void>>(`/users/me/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    http.patch<ApiResponse<void>>("/users/me/notifications/read-all"),

  registerFcmToken: (token: string, platform: "web" | "android" | "ios") =>
    http.post<ApiResponse<void>>("/users/me/fcm-token", { token, platform }),

  getLoginHistory: () =>
    http.get<ApiResponse<LoginSession[]>>("/users/me/login-history"),

  followStore: (storeId: string) =>
    http.post<ApiResponse<void>>(`/users/me/follow/${storeId}`),

  unfollowStore: (storeId: string) =>
    http.delete<ApiResponse<void>>(`/users/me/follow/${storeId}`),

  getAnalytics: () =>
    http.get<ApiResponse<SellerAnalytics>>("/users/me/analytics"),
};

// ─── Stores API ───────────────────────────────────────────────────────────────
export const storesApi = {
  getById: (id: string) =>
    http.get<ApiResponse<Store>>(`/stores/${id}`),

  getBySlug: (slug: string) =>
    http.get<ApiResponse<Store>>(`/stores/slug/${slug}`),

  create: (data: Partial<Store>) =>
    http.post<ApiResponse<Store>>("/stores", data),

  update: (data: Partial<Store> | FormData) =>
    http.patch<ApiResponse<Store>>("/stores/me", data instanceof FormData ? data : data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  getListings: (storeId: string, filters: ListingFilters = {}) =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>(`/stores/${storeId}/listings`, {
      params: filters,
    }),

  getAnalytics: (storeId: string, period: "7d" | "30d" | "90d" = "30d") =>
    http.get<ApiResponse<StoreAnalytics>>(`/stores/${storeId}/analytics`, {
      params: { period },
    }),
};

// ─── Orders API ───────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: {
    listingId: string;
    quantity: number;
    paymentMethod: string;
    deliveryAddress?: string;
    notes?: string;
  }) => http.post<ApiResponse<Order>>("/orders", data),

  getById: (id: string) =>
    http.get<ApiResponse<Order>>(`/orders/${id}`),

  updateStatus: (id: string, status: string) =>
    http.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status }),

  initiatePayment: (orderId: string, method: string, phone?: string) =>
    http.post<ApiResponse<{ paymentUrl?: string; reference: string }>>(`/orders/${orderId}/pay`, {
      method, phone,
    }),

  confirmPayment: (orderId: string, reference: string) =>
    http.post<ApiResponse<Order>>(`/orders/${orderId}/confirm-payment`, { reference }),

  dispute: (orderId: string, reason: string) =>
    http.post<ApiResponse<void>>(`/orders/${orderId}/dispute`, { reason }),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────
export const reviewsApi = {
  create: (data: { sellerId: string; listingId?: string; rating: number; comment: string }) =>
    http.post<ApiResponse<Review>>("/reviews", data),

  getForSeller: (sellerId: string, page = 1) =>
    http.get<ApiResponse<PaginatedResponse<Review>>>(`/reviews/seller/${sellerId}`, {
      params: { page, limit: 10 },
    }),

  getForListing: (listingId: string, page = 1) =>
    http.get<ApiResponse<PaginatedResponse<Review>>>(`/reviews/listing/${listingId}`, {
      params: { page, limit: 10 },
    }),

  reply: (reviewId: string, reply: string) =>
    http.post<ApiResponse<Review>>(`/reviews/${reviewId}/reply`, { reply }),

  report: (reviewId: string, reason: string) =>
    http.post<ApiResponse<void>>(`/reviews/${reviewId}/report`, { reason }),
};

// ─── Payments API ─────────────────────────────────────────────────────────────
export const paymentsApi = {
  getPlans: () =>
    http.get<ApiResponse<SubscriptionPlanConfig[]>>("/payments/plans"),

  subscribe: (planId: string, method: string, phone?: string) =>
    http.post<ApiResponse<{ paymentUrl?: string; reference: string }>>("/payments/subscribe", {
      planId, method, phone,
    }),

  getSubscription: () =>
    http.get<ApiResponse<Subscription>>("/payments/subscription"),

  cancelSubscription: () =>
    http.delete<ApiResponse<void>>("/payments/subscription"),

  getPaymentHistory: (page = 1) =>
    http.get<ApiResponse<PaginatedResponse<PaymentRecord>>>("/payments/history", {
      params: { page, limit: 20 },
    }),

  mtnCallback: (data: unknown) =>
    http.post<ApiResponse<void>>("/payments/mtn/callback", data),

  airtelCallback: (data: unknown) =>
    http.post<ApiResponse<void>>("/payments/airtel/callback", data),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getStats: () =>
    http.get<ApiResponse<PlatformStats>>("/admin/stats"),

  getRevenueChart: (period: "7d" | "30d" | "90d" | "1y" = "30d") =>
    http.get<ApiResponse<RevenueDataPoint[]>>("/admin/revenue-chart", { params: { period } }),

  getCategoryBreakdown: () =>
    http.get<ApiResponse<CategoryBreakdown[]>>("/admin/category-breakdown"),

  // Users
  getUsers: (filters: AdminUserFilters = {}) =>
    http.get<ApiResponse<PaginatedResponse<User>>>("/admin/users", { params: filters }),

  getUserById: (id: string) =>
    http.get<ApiResponse<User>>(`/admin/users/${id}`),

  updateUser: (id: string, data: Partial<User>) =>
    http.patch<ApiResponse<User>>(`/admin/users/${id}`, data),

  banUser: (id: string, reason: string) =>
    http.post<ApiResponse<void>>(`/admin/users/${id}/ban`, { reason }),

  unbanUser: (id: string) =>
    http.post<ApiResponse<void>>(`/admin/users/${id}/unban`),

  verifyUser: (id: string) =>
    http.post<ApiResponse<void>>(`/admin/users/${id}/verify`),

  // Listings
  getListings: (filters: ListingFilters & { status?: string } = {}) =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>("/admin/listings", { params: filters }),

  approveListing: (id: string) =>
    http.post<ApiResponse<void>>(`/admin/listings/${id}/approve`),

  rejectListing: (id: string, reason: string) =>
    http.post<ApiResponse<void>>(`/admin/listings/${id}/reject`, { reason }),

  suspendListing: (id: string, reason: string) =>
    http.post<ApiResponse<void>>(`/admin/listings/${id}/suspend`, { reason }),

  featureListing: (id: string, days: number) =>
    http.post<ApiResponse<void>>(`/admin/listings/${id}/feature`, { days }),

  deleteListing: (id: string) =>
    http.delete<ApiResponse<void>>(`/admin/listings/${id}`),

  // Orders
  getOrders: (filters: { status?: string; page?: number; limit?: number } = {}) =>
    http.get<ApiResponse<PaginatedResponse<Order>>>("/admin/orders", { params: filters }),

  resolveDispute: (orderId: string, resolution: string) =>
    http.post<ApiResponse<void>>(`/admin/orders/${orderId}/resolve`, { resolution }),

  // Subscriptions
  getSubscriptions: (page = 1) =>
    http.get<ApiResponse<PaginatedResponse<Subscription>>>("/admin/subscriptions", {
      params: { page, limit: 20 },
    }),

  // Reports & Moderation
  getReports: (status?: string) =>
    http.get<ApiResponse<PaginatedResponse<Report>>>("/admin/reports", {
      params: { status },
    }),

  resolveReport: (id: string, action: "dismiss" | "warn" | "ban" | "remove") =>
    http.post<ApiResponse<void>>(`/admin/reports/${id}/resolve`, { action }),

  // System
  getSystemHealth: () =>
    http.get<ApiResponse<SystemHealth>>("/admin/system/health"),

  getActivityLog: (page = 1) =>
    http.get<ApiResponse<PaginatedResponse<ActivityLog>>>("/admin/activity-log", {
      params: { page, limit: 50 },
    }),

  // Categories
  getCategories: () =>
    http.get<ApiResponse<CategoryConfig[]>>("/admin/categories"),

  updateCategory: (id: string, data: Partial<CategoryConfig>) =>
    http.patch<ApiResponse<CategoryConfig>>(`/admin/categories/${id}`, data),

  // Notifications (broadcast)
  sendBroadcast: (data: {
    title: string;
    body: string;
    targetGroup: "all" | "sellers" | "buyers" | "pro" | "specific";
    userIds?: string[];
  }) => http.post<ApiResponse<void>>("/admin/notifications/broadcast", data),
};

// ─── WhatsApp API ─────────────────────────────────────────────────────────────
export const whatsappApi = {
  getLeads: (filters: { status?: string; page?: number } = {}) =>
    http.get<ApiResponse<PaginatedResponse<WhatsAppLead>>>("/whatsapp/leads", {
      params: filters,
    }),

  updateLeadStatus: (id: string, status: string) =>
    http.patch<ApiResponse<WhatsAppLead>>(`/whatsapp/leads/${id}`, { status }),

  getConversations: () =>
    http.get<ApiResponse<WhatsAppConversation[]>>("/whatsapp/conversations"),
};

// ─── Search API (Meilisearch proxy) ──────────────────────────────────────────
export const searchApi = {
  search: (query: string, filters: ListingFilters = {}) =>
    http.get<ApiResponse<PaginatedResponse<Listing>>>("/search", {
      params: { q: query, ...filters },
    }),

  getSuggestions: (query: string) =>
    http.get<ApiResponse<string[]>>("/search/suggestions", { params: { q: query } }),
};

// ─── File Upload API ──────────────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: (file: File, folder = "listings") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    return http.post<ApiResponse<{ url: string; key: string; thumbnailUrl: string }>>(
      "/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
};

// ─── Extra type stubs (used by API above) ────────────────────────────────────
export interface LoginSession {
  id: string;
  deviceName: string;
  platform: string;
  ip: string;
  city: string;
  country: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface SellerAnalytics {
  totalViews: number;
  totalInquiries: number;
  totalWhatsAppLeads: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgResponseTime: number;
  topListings: Listing[];
  viewsChart: { date: string; views: number }[];
  leadsChart: { date: string; leads: number }[];
}

export interface StoreAnalytics {
  views: number;
  followers: number;
  leads: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  chart: { date: string; views: number; leads: number; orders: number }[];
}

export interface SubscriptionPlanConfig {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: Record<string, string | number | boolean>;
  maxListings: number;
  isPopular: boolean;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string;
  description: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reportedBy: User;
  targetType: "listing" | "user" | "review";
  targetId: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  database: "up" | "down";
  redis: "up" | "down";
  meilisearch: "up" | "down";
  storage: "up" | "down";
  whatsapp: "up" | "down";
  uptime: number;
  version: string;
  lastChecked: string;
}

export interface ActivityLog {
  id: string;
  admin: User;
  action: string;
  target: string;
  targetId: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  listingCount: number;
  sortOrder: number;
}

export interface WhatsAppConversation {
  id: string;
  contactPhone: string;
  contactName?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  listingId?: string;
}

export { http };
