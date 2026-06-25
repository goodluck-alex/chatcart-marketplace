// ─── ChatCart Global State (Zustand) ──────────────────────────────────────────
// Single source of truth for auth, cart, notifications, and UI state.

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { User, Notification, Listing } from "./types";
import { tokenStorage } from "./api";

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;

  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  setLoading: (v: boolean) => void;
  setSessionId: (id: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionId: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (access, refresh) => tokenStorage.set(access, refresh),
      setLoading: (isLoading) => set({ isLoading }),
      setSessionId: (sessionId) => set({ sessionId }),
      logout: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false, sessionId: null });
      },
      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    { name: "cc-auth", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

// ─── Notifications Store ──────────────────────────────────────────────────────
interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotifStore = create<NotifState>()((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter(n => !n.isRead).length }),

  addNotification: (notif) =>
    set((s) => ({
      notifications: [notif, ...s.notifications],
      unreadCount: s.unreadCount + (notif.isRead ? 0 : 1),
    })),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));

// ─── Wishlist Store ────────────────────────────────────────────────────────────
interface WishlistState {
  ids: Set<string>;
  listings: Listing[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (listing: Listing) => void;
  setWishlist: (listings: Listing[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  subscribeWithSelector((set, get) => ({
    ids: new Set<string>(),
    listings: [],

    isInWishlist: (id) => get().ids.has(id),

    toggleWishlist: (listing) =>
      set((s) => {
        const ids = new Set(s.ids);
        let listings = [...s.listings];
        if (ids.has(listing.id)) {
          ids.delete(listing.id);
          listings = listings.filter(l => l.id !== listing.id);
        } else {
          ids.add(listing.id);
          listings.push(listing);
        }
        return { ids, listings };
      }),

    setWishlist: (listings) =>
      set({ listings, ids: new Set(listings.map(l => l.id)) }),
  }))
);

// ─── UI / Navigation Store ────────────────────────────────────────────────────
type Page =
  | "home" | "listings" | "listing" | "sell" | "chats" | "profile"
  | "pricing" | "roadmap" | "docs" | "admin" | "admin-users" | "admin-listings" | "admin-orders"
  | "admin-subscriptions" | "admin-analytics" | "admin-settings" | "admin-reports"
  | "store" | "order-detail" | "seller-dashboard";

interface UIState {
  currentPage: Page;
  pageData: unknown;
  searchQuery: string;
  selectedCategory: string;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  modal: { type: string; data?: unknown } | null;

  navigate: (page: Page, data?: unknown) => void;
  setSearch: (q: string) => void;
  setCategory: (cat: string) => void;
  setMobileMenu: (open: boolean) => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  currentPage: "home",
  pageData: null,
  searchQuery: "",
  selectedCategory: "all",
  isMobileMenuOpen: false,
  isSearchOpen: false,
  modal: null,

  navigate: (currentPage, pageData = null) => {
    set({ currentPage, pageData });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setSearch: (searchQuery) => set({ searchQuery }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setMobileMenu: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  openModal: (type, data) => set({ modal: { type, data } }),
  closeModal: () => set({ modal: null }),
}));

// ─── Admin Store ──────────────────────────────────────────────────────────────
import type { PlatformStats } from "./types";

interface AdminState {
  stats: PlatformStats | null;
  isAdminAuthenticated: boolean;
  adminSidebarOpen: boolean;
  setStats: (stats: PlatformStats) => void;
  setAdminAuth: (v: boolean) => void;
  toggleAdminSidebar: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  stats: null,
  isAdminAuthenticated: false,
  adminSidebarOpen: true,

  setStats: (stats) => set({ stats }),
  setAdminAuth: (isAdminAuthenticated) => set({ isAdminAuthenticated }),
  toggleAdminSidebar: () => set((s) => ({ adminSidebarOpen: !s.adminSidebarOpen })),
}));
