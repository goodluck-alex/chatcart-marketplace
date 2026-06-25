import { useState } from "react";
import { Settings, LogOut, Heart, Package, Star, ChevronRight, Shield, Bell, HelpCircle, Edit3, TrendingUp, Eye, MessageCircle } from "lucide-react";
import { listings } from "../data/listings";

interface Props {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function ProfilePage({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "wishlist">("listings");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  const myListings = listings.slice(0, 3);
  const wishlist = listings.filter(l => l.featured).slice(0, 4);

  if (!isLoggedIn) {
    return (
      <div className="max-w-sm mx-auto px-6 pb-24 md:pb-8">
        {/* Logo */}
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-purple-200">
            🛒
          </div>
          <h1 className="text-2xl font-black text-gray-900">Welcome to <span className="text-purple-600">ChatCart</span></h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to buy, sell & manage your listings</p>
        </div>

        {loginStep === "phone" ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <div className="flex gap-2">
                <div className="px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600">🇺🇬 +256</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="7XX XXX XXX"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
            <button
              onClick={() => setLoginStep("otp")}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-2xl hover:bg-purple-700 transition-colors mb-4 shadow-lg shadow-purple-200"
            >
              Send OTP Code
            </button>
            <div className="text-center text-sm text-gray-400 mb-4">or continue with</div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-2xl py-3 hover:border-purple-200 hover:bg-purple-50 transition-all text-sm font-medium">
                <span className="text-xl">G</span> Google
              </button>
              <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-2xl py-3 hover:border-purple-200 hover:bg-purple-50 transition-all text-sm font-medium">
                <span className="text-xl">🍎</span> Apple
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to</p>
              <p className="font-bold text-gray-900">+256 {phone}</p>
            </div>
            <div className="flex gap-2 justify-center mb-6">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 text-center border-2 border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:border-purple-500 transition-colors"
                />
              ))}
            </div>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              Verify & Login
            </button>
            <button onClick={() => setLoginStep("phone")} className="w-full text-center text-sm text-purple-600 font-medium mt-3">
              ← Change number
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
      {/* Profile Header */}
      <div className="py-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-black">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">Alex Mukasa</h2>
                  <Shield className="w-4 h-4 text-blue-300" />
                </div>
                <p className="text-purple-200 text-sm">+256 700 000 001</p>
                <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                  ⭐ Verified Seller
                </span>
              </div>
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Edit3 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Listings", value: "3", icon: Package },
              { label: "Views", value: "1.2K", icon: Eye },
              { label: "Rating", value: "4.8", icon: Star },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-purple-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-gray-800 text-sm">Store Performance</span>
            </div>
            <span className="text-xs text-purple-600 font-medium">This month</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Inquiries", value: "47", change: "+12%", color: "text-green-500" },
              { label: "WhatsApp Leads", value: "23", change: "+8%", color: "text-green-500" },
              { label: "Conversions", value: "9", change: "+3%", color: "text-green-500" },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-black text-gray-900">{m.value}</div>
                <div className="text-[10px] text-gray-500">{m.label}</div>
                <div className={`text-[10px] font-bold ${m.color}`}>{m.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-4">
          {(["listings", "orders", "wishlist"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "listings" && (
          <div className="space-y-3">
            {myListings.map(l => (
              <div
                key={l.id}
                onClick={() => onNavigate("listing", l.id)}
                className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-3 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <img src={l.image} alt={l.title} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{l.title}</p>
                  <p className="text-purple-600 font-bold text-sm">{l.price}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Eye className="w-3 h-3" /> {l.views}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><MessageCircle className="w-3 h-3" /> 12</span>
                    <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 self-center shrink-0" />
              </div>
            ))}
            <button
              onClick={() => onNavigate("sell")}
              className="w-full border-2 border-dashed border-purple-200 text-purple-600 font-bold py-3 rounded-2xl hover:bg-purple-50 transition-colors text-sm flex items-center justify-center gap-2"
            >
              + Post New Listing
            </button>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-3">
            {[
              { id: "#CC2401", title: "MacBook Pro M2 2022", status: "Delivered", date: "Jan 15", price: "UGX 2,500,000", icon: "📱" },
              { id: "#CC2312", title: "Professional Photography Session", status: "Completed", date: "Dec 28", price: "UGX 500,000", icon: "📸" },
            ].map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {order.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{order.title}</p>
                  <p className="text-xs text-gray-400">{order.id} · {order.date}</p>
                  <p className="text-purple-600 font-bold text-sm">{order.price}</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full shrink-0">{order.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="grid grid-cols-2 gap-3">
            {wishlist.map(l => (
              <div
                key={l.id}
                onClick={() => onNavigate("listing", l.id)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  <img src={l.image} alt={l.title} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-gray-800 line-clamp-2">{l.title}</p>
                  <p className="text-xs text-purple-600 font-bold mt-1">{l.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Access */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("seller-dashboard")}
            className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-4 text-left hover:shadow-lg hover:shadow-purple-200 transition-all"
          >
            <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
            <p className="font-black text-sm">Seller Dashboard</p>
            <p className="text-xs text-purple-200">Analytics & listings</p>
          </button>
          <button
            onClick={() => onNavigate("admin")}
            className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl p-4 text-left hover:shadow-lg transition-all"
          >
            <Shield className="w-5 h-5 mb-2 opacity-80" />
            <p className="font-black text-sm">Admin Console</p>
            <p className="text-xs text-gray-400">Platform management</p>
          </button>
        </div>

        {/* Settings Menu */}
        <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: Settings, label: "Account Settings", color: "text-gray-600" },
            { icon: Bell, label: "Notifications", color: "text-gray-600" },
            { icon: Shield, label: "Security", color: "text-gray-600" },
            { icon: HelpCircle, label: "Help & Support", color: "text-gray-600" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-700 text-left">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setIsLoggedIn(false)}
          className="w-full flex items-center justify-center gap-2 mt-4 text-red-500 font-semibold py-3 rounded-2xl border-2 border-red-100 hover:bg-red-50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">ChatCart v1.0 · Uganda, Kenya, Tanzania</p>
      </div>
    </div>
  );
}
