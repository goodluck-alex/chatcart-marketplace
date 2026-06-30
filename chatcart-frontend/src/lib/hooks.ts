// ─── ChatCart Data Hooks ───────────────────────────────────────────────────────
// React Query hooks that call real API endpoints and fall back to mock data
// when the backend is not yet connected (VITE_API_BASE_URL not set to real URL).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsApi, usersApi, adminApi, ordersApi, reviewsApi, storesApi } from "./api";
import {
  mockListings, mockPlatformStats, mockRevenueChart, mockCategoryBreakdown,
  mockOrders, mockReviews, mockNotifications, mockWhatsAppLeads, mockUser,
} from "./mock-data";
import type { ListingFilters, AdminUserFilters } from "./types";
import { useAuthStore } from "./store";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK MODE — controls whether API calls hit the real backend or use local data
//
//  true  → Uses mock data from src/lib/mock-data.ts (no backend needed)
//  false → Calls real NestJS backend at VITE_API_BASE_URL (.env)
//
// To connect real backend:
//  1. Start backend:  cd backend && npm run start:dev
//  2. Set .env:       VITE_API_BASE_URL=http://localhost:3001/v1
//  3. Change below:   USE_MOCK = false
//  4. Restart dev:    npm run dev
// ─────────────────────────────────────────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ─── Listings ─────────────────────────────────────────────────────────────────
export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(400);
        let items = [...mockListings];
        if (filters.category) items = items.filter(l => l.category === filters.category);
        if (filters.query) {
          const q = filters.query.toLowerCase();
          items = items.filter(l =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.location.city.toLowerCase().includes(q)
          );
        }
        if (filters.minPrice) items = items.filter(l => l.price >= filters.minPrice!);
        if (filters.maxPrice) items = items.filter(l => l.price <= filters.maxPrice!);
        if (filters.sellerVerified) items = items.filter(l => l.seller.isVerified);
        if (filters.isFeatured) items = items.filter(l => l.isFeatured);
        if (filters.sortBy === "price_asc") items.sort((a, b) => a.price - b.price);
        else if (filters.sortBy === "price_desc") items.sort((a, b) => b.price - a.price);
        else if (filters.sortBy === "popular") items.sort((a, b) => b.views - a.views);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const start = (page - 1) * limit;
        return { items: items.slice(start, start + limit), meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit), hasNextPage: start + limit < items.length, hasPrevPage: page > 1 } };
      }
      const res = await listingsApi.getAll(filters);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(300);
        const listing = mockListings.find(l => l.id === id);
        if (!listing) throw new Error("Listing not found");
        return listing;
      }
      const res = await listingsApi.getById(id);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useFeaturedListings(limit = 8) {
  return useQuery({
    queryKey: ["listings", "featured", limit],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(300);
        return mockListings.filter(l => l.isFeatured).slice(0, limit);
      }
      try {
        const res = await listingsApi.getFeatured(limit);
        return res.data.data;
      } catch {
        return mockListings.filter(l => l.isFeatured).slice(0, limit);
      }
    },
    staleTime: 120_000,
  });
}

export function useRecommendations(filters: { city?: string; category?: string; query?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ["listings", "recommendations", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(300);
        return mockListings.slice(0, filters.limit ?? 6);
      }
      try {
        const res = await listingsApi.getRecommendations(filters);
        return res.data.data;
      } catch {
        return mockListings.slice(0, filters.limit ?? 6);
      }
    },
    staleTime: 120_000,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(400);
        return { items: mockListings.slice(0, 5), meta: { total: 5, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
      }
      const res = await listingsApi.getMyListings();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      if (USE_MOCK) {
        await delay(1500);
        return mockListings[0];
      }
      const res = await listingsApi.create(data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      if (USE_MOCK) { await delay(1000); return mockListings[0]; }
      const res = await listingsApi.update(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listing", id] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) { await delay(800); return; }
      await listingsApi.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

export function useTrackWhatsAppClick() {
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) { await delay(100); return; }
      await listingsApi.trackWhatsAppClick(id);
    },
  });
}

// ─── Auth / User ──────────────────────────────────────────────────────────────
export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      if (USE_MOCK) { await delay(200); return mockUser; }
      const res = await usersApi.getProfile("me");
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 300_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      if (USE_MOCK) { await delay(800); return mockUser; }
      const res = await usersApi.updateProfile(data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export function useWishlist() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (USE_MOCK) { await delay(300); return { items: mockListings.filter(l => l.isFeatured), meta: { total: 4, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false } }; }
      const res = await usersApi.getWishlist();
      return res.data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isWishlisted }: { id: string; isWishlisted: boolean }) => {
      if (USE_MOCK) { await delay(200); return; }
      if (isWishlisted) await usersApi.removeFromWishlist(id);
      else await usersApi.addToWishlist(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (USE_MOCK) { await delay(200); return mockNotifications; }
      const res = await usersApi.getNotifications();
      return res.data.data.items;
    },
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export function useOrders(status?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      if (USE_MOCK) { await delay(400); return { items: mockOrders, meta: { total: 3, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false } }; }
      const res = await usersApi.getOrders(status);
      return res.data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { listingId: string; quantity: number; paymentMethod: string; notes?: string }) => {
      if (USE_MOCK) { await delay(1500); return mockOrders[0]; }
      const res = await ordersApi.create(data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export function useReviews(sellerId: string) {
  return useQuery({
    queryKey: ["reviews", sellerId],
    queryFn: async () => {
      if (USE_MOCK) { await delay(300); return mockReviews; }
      const res = await reviewsApi.getForSeller(sellerId);
      return res.data.data.items;
    },
    enabled: !!sellerId,
  });
}

// ─── Seller Analytics ─────────────────────────────────────────────────────────
export function useSellerAnalytics() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["seller-analytics"],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return {
          totalViews: 12480,
          totalInquiries: 347,
          totalWhatsAppLeads: 189,
          totalOrders: 47,
          totalRevenue: 127500000,
          conversionRate: 13.5,
          avgResponseTime: 8,
          topListings: mockListings.slice(0, 3),
          viewsChart: mockRevenueChart.map(d => ({ date: d.date, views: Math.floor(Math.random() * 500) + 100 })),
          leadsChart: mockRevenueChart.map(d => ({ date: d.date, leads: Math.floor(Math.random() * 20) + 2 })),
        };
      }
      const res = await usersApi.getAnalytics();
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 300_000,
  });
}

// ─── WhatsApp Leads ───────────────────────────────────────────────────────────
export function useWhatsAppLeads() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["whatsapp-leads"],
    queryFn: async () => {
      if (USE_MOCK) { await delay(300); return mockWhatsAppLeads; }
      const res = await storesApi.getAnalytics("str_01");
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

// ─── Admin: Platform Stats ────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (USE_MOCK) { await delay(500); return mockPlatformStats; }
      const res = await adminApi.getStats();
      return res.data.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useAdminRevenueChart(period: "7d" | "30d" | "90d" | "1y" = "30d") {
  return useQuery({
    queryKey: ["admin-revenue-chart", period],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(400);
        const n = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
        return Array.from({ length: n }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (n - 1 - i));
          return {
            date: date.toISOString().split("T")[0],
            revenue: 80000000 + Math.random() * 120000000,
            orders: 50 + Math.floor(Math.random() * 150),
            subscriptions: 10 + Math.floor(Math.random() * 40),
            featuredListings: 5 + Math.floor(Math.random() * 25),
          };
        });
      }
      const res = await adminApi.getRevenueChart(period);
      return res.data.data;
    },
    staleTime: 300_000,
  });
}

export function useAdminCategoryBreakdown() {
  return useQuery({
    queryKey: ["admin-category-breakdown"],
    queryFn: async () => {
      if (USE_MOCK) { await delay(300); return mockCategoryBreakdown; }
      const res = await adminApi.getCategoryBreakdown();
      return res.data.data;
    },
    staleTime: 300_000,
  });
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        const users = Array.from({ length: 50 }, (_, i) => ({
          ...mockUser,
          id: `usr_${String(i + 1).padStart(3, "0")}`,
          firstName: ["Alex", "Sarah", "Moses", "Grace", "David", "Amina", "John", "Mary"][i % 8],
          lastName: ["Mukasa", "Namuli", "Ouma", "Atim", "Ssemwanga", "Nakato", "Kironde", "Apio"][i % 8],
          phone: `+25670${String(i).padStart(7, "0")}`,
          role: (["buyer", "seller", "business", "seller", "buyer"][i % 5]) as any,
          subscriptionPlan: (["free", "free", "individual", "starter", "pro"][i % 5]) as any,
          isVerified: i % 3 !== 0,
          isBanned: i === 7,
          totalListings: Math.floor(Math.random() * 20),
          totalSales: Math.floor(Math.random() * 50),
          rating: 3.5 + Math.random() * 1.5,
          joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString(),
        }));
        const q = filters.query?.toLowerCase();
        const filtered = q ? users.filter(u => u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.phone.includes(q)) : users;
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const start = (page - 1) * limit;
        return { items: filtered.slice(start, start + limit), meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit), hasNextPage: start + limit < filtered.length, hasPrevPage: page > 1 } };
      }
      const res = await adminApi.getUsers(filters);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useAdminListings(filters: ListingFilters & { status?: string } = {}) {
  return useQuery({
    queryKey: ["admin-listings", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        let items = [...mockListings, ...mockListings.map(l => ({ ...l, id: l.id + "_b", status: "pending_review" as const }))];
        if (filters.category) items = items.filter(l => l.category === filters.category);
        const statusFilter: string | undefined = filters.status;
        if (statusFilter && statusFilter !== "all") items = items.filter(l => (l.status as string) === statusFilter);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const start = (page - 1) * limit;
        return { items: items.slice(start, start + limit), meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit), hasNextPage: start + limit < items.length, hasPrevPage: page > 1 } };
      }
      const res = await adminApi.getListings(filters);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useAdminOrders(filters: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(400);
        const orders = [...mockOrders, ...mockOrders.map(o => ({ ...o, id: o.id + "_b", orderNumber: o.orderNumber + "X" }))];
        return { items: orders, meta: { total: orders.length, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
      }
      const res = await adminApi.getOrders(filters);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

// ─── Admin mutations ──────────────────────────────────────────────────────────
export function useAdminBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      if (USE_MOCK) { await delay(500); return; }
      await adminApi.banUser(id, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useAdminVerifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) { await delay(500); return; }
      await adminApi.verifyUser(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useAdminApproveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) { await delay(500); return; }
      await adminApi.approveListing(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-listings"] }),
  });
}

export function useAdminRejectListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      if (USE_MOCK) { await delay(500); return; }
      await adminApi.rejectListing(id, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-listings"] }),
  });
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
