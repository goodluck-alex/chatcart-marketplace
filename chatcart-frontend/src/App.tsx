import { useEffect } from "react";
import { useUIStore, useAuthStore, useNotifStore } from "./lib/store";
import { mockUser, mockNotifications } from "./lib/mock-data";

// Public pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import SellPage from "./pages/SellPage";
import ChatsPage from "./pages/ChatsPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import RoadmapPage from "./pages/RoadmapPage";
import DocsPage from "./pages/DocsPage";

// Admin pages
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminListings from "./admin/AdminListings";
import AdminOrders from "./admin/AdminOrders";
import AdminSettings from "./admin/AdminSettings";

const ADMIN_PAGES = [
  "admin", "admin-analytics", "admin-users", "admin-listings",
  "admin-orders", "admin-subscriptions", "admin-reports", "admin-settings",
];

const FOOTER_PAGES = ["home", "listings", "pricing", "roadmap", "docs"];

export default function App() {
  const { currentPage, pageData, searchQuery, navigate: navFn, setSearch } = useUIStore();
  // Cast to string-based navigate for components that use string signatures
  const navigate = navFn as unknown as (page: string, data?: unknown) => void;
  const { setUser, setTokens } = useAuthStore();
  const { setNotifications } = useNotifStore();

  // Bootstrap mock auth (replace with real auth flow)
  useEffect(() => {
    setUser(mockUser);
    setTokens("mock_access_token", "mock_refresh_token");
    setNotifications(mockNotifications);
  }, []);

  const isAdminPage = ADMIN_PAGES.includes(currentPage);
  const showFooter = FOOTER_PAGES.includes(currentPage);

  // ─── Admin layout ──────────────────────────────────────────────────────────
  if (isAdminPage) {
    return (
      <AdminLayout activePage={currentPage} onNavigate={navigate}>
        {currentPage === "admin" && <AdminDashboard onNavigate={navigate} />}
        {currentPage === "admin-analytics" && <AdminDashboard onNavigate={navigate} />}
        {currentPage === "admin-users" && <AdminUsers />}
        {currentPage === "admin-listings" && <AdminListings />}
        {currentPage === "admin-orders" && <AdminOrders />}
        {currentPage === "admin-settings" && <AdminSettings />}
        {(currentPage === "admin-subscriptions" || currentPage === "admin-reports") && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">🚧</div>
              <p className="font-bold text-gray-400 text-lg capitalize">{currentPage.replace("admin-", "")} Module</p>
              <p className="text-gray-600 text-sm mt-1">Coming soon – under construction</p>
            </div>
          </div>
        )}
      </AdminLayout>
    );
  }

  // ─── Public layout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        searchQuery={searchQuery}
        onSearch={(q) => { setSearch(q); if (q) navigate("listings"); }}
      />

      <main className="page-enter">
        {currentPage === "home" && (
          <HomePage onNavigate={navigate} searchQuery={searchQuery} />
        )}
        {currentPage === "listings" && (
          <ListingsPage onNavigate={navigate} searchQuery={searchQuery} />
        )}
        {currentPage === "listing" && (
          <ListingDetailPage listingId={String(pageData)} onNavigate={navigate} />
        )}
        {currentPage === "sell" && (
          <SellPage onNavigate={navigate} />
        )}
        {currentPage === "chats" && (
          <ChatsPage onNavigate={navigate} />
        )}
        {currentPage === "profile" && (
          <ProfilePage onNavigate={navigate} />
        )}
        {currentPage === "pricing" && (
          <PricingPage onNavigate={navigate} />
        )}
        {currentPage === "seller-dashboard" && (
          <SellerDashboardPage onNavigate={navigate} />
        )}
        {currentPage === "roadmap" && (
          <RoadmapPage onNavigate={navigate} />
        )}
        {currentPage === "docs" && (
          <DocsPage onNavigate={navigate} />
        )}
      </main>

      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}
