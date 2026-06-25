import { useState } from "react";
import {
  LayoutDashboard, Users, Package, ShoppingCart, CreditCard, BarChart3,
  Settings, Bell, LogOut, Menu, X, ChevronDown,
  AlertTriangle, Globe, Activity
} from "lucide-react";
import { useAdminStore, useAuthStore } from "../lib/store";
import { useNotifications } from "../lib/hooks";

interface Props {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "admin",                 label: "Dashboard",      icon: LayoutDashboard, badge: null },
  { id: "admin-analytics",      label: "Analytics",      icon: BarChart3,       badge: null },
  { id: "admin-users",          label: "Users",          icon: Users,           badge: "48.3K" },
  { id: "admin-listings",       label: "Listings",       icon: Package,         badge: "124K" },
  { id: "admin-orders",         label: "Orders",         icon: ShoppingCart,    badge: "23K" },
  { id: "admin-subscriptions",  label: "Subscriptions",  icon: CreditCard,      badge: null },
  { id: "admin-reports",        label: "Reports",        icon: AlertTriangle,   badge: "12" },
  { id: "admin-settings",       label: "Settings",       icon: Settings,        badge: null },
];

export default function AdminLayout({ children, activePage, onNavigate }: Props) {
  const { adminSidebarOpen, toggleAdminSidebar } = useAdminStore();
  const { user, logout } = useAuthStore();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter(n => !n.isRead).length ?? 0;
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 shrink-0 ${
          adminSidebarOpen ? "w-56" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 text-sm shadow-lg">
            🛒
          </div>
          {adminSidebarOpen && (
            <div>
              <span className="font-bold text-white text-sm">Chat</span>
              <span className="font-bold text-purple-400 text-sm">Cart</span>
              <div className="text-[10px] text-gray-500 font-medium -mt-0.5">Admin Console</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
                title={!adminSidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {adminSidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-700 text-gray-300"}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        {adminSidebarOpen && (
          <div className="px-4 py-3 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">System Status</span>
            </div>
            {[
              { label: "API", status: "up" },
              { label: "Database", status: "up" },
              { label: "Search", status: "up" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-0.5">
                <span className="text-[10px] text-gray-500">{s.label}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-green-400">Online</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User + collapse */}
        <div className="border-t border-gray-800 p-3 space-y-2">
          <button
            onClick={toggleAdminSidebar}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-white text-xs transition-colors"
          >
            {adminSidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            {adminSidebarOpen && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-gray-200 capitalize">
              {navItems.find(n => n.id === activePage)?.label ?? "Admin"}
            </h1>
            <div className="text-gray-600 text-xs">/ ChatCart</div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 w-56">
              <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
              </svg>
              <input placeholder="Search..." className="bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none w-full" />
            </div>

            {/* Notifications */}
            <button className="relative w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Bell className="w-4 h-4 text-gray-400" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {/* Go to site */}
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              View Site
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName[0] ?? "A"}
                </div>
                <span className="text-xs text-gray-300 hidden md:block">{user?.firstName ?? "Admin"}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-10 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className="text-[10px] bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full font-bold capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={() => { onNavigate("admin-settings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <button
                    onClick={() => { logout(); onNavigate("home"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
              {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
