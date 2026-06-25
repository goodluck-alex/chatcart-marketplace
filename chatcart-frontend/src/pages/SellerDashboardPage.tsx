import { useState } from "react";
import {
  TrendingUp, Package, Eye, MessageCircle, DollarSign,
  Plus, ArrowUpRight, ChevronRight, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useMyListings, useSellerAnalytics, useOrders } from "../lib/hooks";
import { format } from "date-fns";

interface Props { onNavigate: (page: string, data?: unknown) => void; }

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function SellerDashboardPage({ onNavigate }: Props) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data: listingsData } = useMyListings();
  const { data: analytics } = useSellerAnalytics();
  const { data: ordersData } = useOrders();

  const chartData = (period === "7d"
    ? analytics?.viewsChart.slice(-7)
    : period === "30d" ? analytics?.viewsChart.slice(-30) : analytics?.viewsChart
  ) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm">Track your performance and manage listings</p>
        </div>
        <button
          onClick={() => onNavigate("sell")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-200"
        >
          <Plus className="w-4 h-4" /> New Listing
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Views", value: fmt(analytics?.totalViews ?? 0), icon: Eye, color: "from-blue-500 to-indigo-600", change: "+18%" },
          { label: "WhatsApp Leads", value: fmt(analytics?.totalWhatsAppLeads ?? 0), icon: MessageCircle, color: "from-green-500 to-emerald-600", change: "+24%" },
          { label: "Total Orders", value: fmt(analytics?.totalOrders ?? 0), icon: Package, color: "from-purple-500 to-violet-600", change: "+12%" },
          { label: "Revenue", value: `UGX ${fmt(analytics?.totalRevenue ?? 0)}`, icon: DollarSign, color: "from-orange-500 to-amber-600", change: "+31%" },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />{stat.change}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-0.5">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Views Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-gray-900">Listing Views</h2>
              <p className="text-xs text-gray-400">Views over time</p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(["7d", "30d", "90d"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-700"}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={d => format(new Date(d), "MMM d")} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} formatter={(v: unknown) => [(v as number).toLocaleString(), "Views"]} />
              <Area type="monotone" dataKey="views" stroke="#7c3aed" strokeWidth={2} fill="url(#viewGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* WhatsApp Leads */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">WA Leads</h2>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">Live</span>
          </div>
          <div className="text-center py-3 mb-4">
            <div className="text-4xl font-black text-gray-900">{analytics?.totalWhatsAppLeads ?? 0}</div>
            <p className="text-sm text-gray-500">Total leads this period</p>
            <div className="flex items-center justify-center gap-1 mt-1 text-sm font-bold text-green-600">
              <TrendingUp className="w-3.5 h-3.5" />
              {analytics?.conversionRate ?? 0}% conversion
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "New", count: 4, color: "bg-purple-500" },
              { label: "Contacted", count: 8, color: "bg-blue-500" },
              { label: "Converted", count: 11, color: "bg-green-500" },
              { label: "Lost", count: 3, color: "bg-gray-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                <span className="text-xs font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#25D366] rounded-xl p-3 text-white text-center text-xs font-bold cursor-pointer hover:bg-[#1da851] transition-colors">
            📲 View All WhatsApp Leads
          </div>
        </div>
      </div>

      {/* My Listings + Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* My Listings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">My Listings</h2>
            <button
              onClick={() => onNavigate("listings")}
              className="text-xs text-purple-600 font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {listingsData?.items.slice(0, 4).map(listing => (
              <div
                key={listing.id}
                onClick={() => onNavigate("listing", listing.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={listing.thumbnail} alt={listing.title} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{listing.title}</p>
                  <p className="text-purple-600 font-bold text-xs">UGX {listing.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Eye className="w-2.5 h-2.5" />{listing.views}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-green-500 font-bold">💬 {listing.whatsappLeads} leads</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${listing.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {listing.status}
                  </span>
                  {listing.isFeatured && <span className="text-[10px] font-bold text-yellow-600">⭐ Featured</span>}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("sell")}
            className="w-full mt-3 border-2 border-dashed border-purple-200 text-purple-600 font-bold py-2.5 rounded-xl hover:bg-purple-50 transition-colors text-sm"
          >
            + Add New Listing
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">Recent Orders</h2>
            <span className="text-xs text-gray-400">{ordersData?.meta.total ?? 0} total</span>
          </div>
          <div className="space-y-3">
            {ordersData?.items.map(order => (
              <div key={order.id} className="p-3 rounded-xl border border-gray-100 hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-purple-600">#{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    order.status === "completed" ? "bg-green-100 text-green-700" :
                    order.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">{order.listing.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{order.buyer.firstName} {order.buyer.lastName}</p>
                  <p className="text-sm font-black text-gray-900">UGX {order.totalAmount.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-black text-white">Admin Console</h3>
          <p className="text-gray-400 text-sm">Access platform-wide analytics, user management, and settings</p>
        </div>
        <button
          onClick={() => onNavigate("admin")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          Open Admin <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
