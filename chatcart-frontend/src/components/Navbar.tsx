import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, Plus, Home, LayoutGrid, MessageCircle,
  User, X, MapPin, ChevronDown, Sparkles, ShieldCheck,
  BookOpen, BarChart3
} from "lucide-react";
import { useNotifStore } from "../lib/store";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}



export default function Navbar({ currentPage, onNavigate, searchQuery, onSearch }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { id: "listings",         label: "Browse",    icon: LayoutGrid  },
    { id: "pricing",          label: "Pricing",   icon: Sparkles    },
    { id: "seller-dashboard", label: "Dashboard", icon: BarChart3   },
  ];

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100/80"
        style={{ boxShadow: "0 1px 16px rgba(124,58,237,.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-3">

            {/* Logo */}
            <button onClick={() => onNavigate("home")}
              className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-lg"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                🛒
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <div className="text-[17px] font-black tracking-tight">
                  <span className="text-gray-900">Chat</span>
                  <span style={{ color: "#7c3aed" }}>Cart</span>
                </div>
                <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Marketplace</span>
              </div>
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-3">
              <div className={`relative w-full transition-all duration-200 ${searchFocused ? "scale-[1.01]" : ""}`}>
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? "text-purple-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Search listings, stores, locations…"
                  value={searchQuery}
                  onChange={e => onSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-10 pr-24 py-2.5 text-sm rounded-2xl outline-none transition-all"
                  style={{
                    background: searchFocused ? "#fff" : "#f5f3ff",
                    border: `1.5px solid ${searchFocused ? "#7c3aed" : "#ede9fe"}`,
                    boxShadow: searchFocused ? "0 0 0 3px rgba(124,58,237,.1)" : "none",
                  }}
                />
                {searchQuery && (
                  <button onClick={() => onSearch("")}
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => searchQuery && onNavigate("listings")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                  Search
                </button>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <button key={link.id} onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === link.id
                      ? "text-purple-700 bg-purple-50"
                      : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/60"
                  }`}>
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </button>
              ))}

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200 mx-1" />

              <button onClick={() => onNavigate("docs")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100">
                <BookOpen className="w-3 h-3" />Docs
              </button>
              <button onClick={() => onNavigate("admin")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 bg-gray-900 hover:bg-gray-800 transition-all">
                <ShieldCheck className="w-3 h-3" />Admin
              </button>

              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 px-2 py-1.5 rounded-xl hover:bg-purple-50 transition-all">
                <MapPin className="w-3 h-3" /><span>Kampala</span><ChevronDown className="w-3 h-3" />
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0 shrink-0">
              {/* Sell CTA */}
              <button onClick={() => onNavigate("sell")}
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2.5 rounded-2xl transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 14px rgba(124,58,237,.35)" }}>
                <Plus className="w-4 h-4" />
                <span>Sell Now</span>
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-2xl border transition-all"
                  style={{ background: "#f5f3ff", borderColor: "#ede9fe" }}>
                  <Bell className="w-4 h-4 text-purple-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl z-50 animate-scale-in overflow-hidden"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.06)", border: "1px solid #ede9fe" }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-bold text-gray-900 text-sm">Notifications</span>
                      <button onClick={() => markAllRead()} className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.slice(0, 6).map(n => (
                        <button key={n.id} onClick={() => markRead(n.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-purple-50/60" : ""}`}>
                          <span className="text-xl shrink-0 mt-0.5">{n.icon ?? "🔔"}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-600"}`}>{n.body}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{n.title}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />}
                        </button>
                      ))}
                      {notifications.length === 0 && (
                        <div className="py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <button onClick={() => onNavigate("profile")}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-md"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                A
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input type="text" placeholder="Search anything…" value={searchQuery}
                onChange={e => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl outline-none"
                style={{ background: "#f5f3ff", border: "1.5px solid #ede9fe" }} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ──────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden mobile-bottom-nav"
        style={{ background: "rgba(255,255,255,.97)", backdropFilter: "blur(16px)", borderTop: "1px solid #f3e8ff", boxShadow: "0 -4px 24px rgba(124,58,237,.1)" }}>
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { id: "home",     icon: Home,           label: "Home"    },
            { id: "listings", icon: LayoutGrid,      label: "Browse"  },
            { id: "sell",     icon: Plus,            label: "Sell",   special: true },
            { id: "chats",    icon: MessageCircle,   label: "Chats"   },
            { id: "profile",  icon: User,            label: "Profile" },
          ].map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative">
              {item.special ? (
                <div className="w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center text-white shadow-xl"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 24px rgba(124,58,237,.45)" }}>
                  <Plus className="w-6 h-6" />
                </div>
              ) : (
                <>
                  {currentPage === item.id && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                      style={{ background: "#7c3aed" }} />
                  )}
                  <item.icon className="w-5 h-5 mb-0.5"
                    style={{ color: currentPage === item.id ? "#7c3aed" : "#9ca3af" }} />
                  <span className="text-[10px] font-semibold"
                    style={{ color: currentPage === item.id ? "#7c3aed" : "#9ca3af" }}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
