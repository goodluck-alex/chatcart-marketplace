import { useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign,
  MessageCircle, Star, Eye, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAdminStats, useAdminRevenueChart, useAdminCategoryBreakdown } from "../lib/hooks";
import { format } from "date-fns";

interface Props { onNavigate: (page: string) => void; }

const COLORS = ["#7c3aed", "#2563eb", "#f97316", "#ec4899", "#14b8a6", "#eab308"];

function StatCard({ label, value, change, icon: Icon, color, onClick }: {
  label: string; value: string; change?: number; icon: React.ElementType; color: string; onClick?: () => void;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left hover:border-gray-700 hover:shadow-xl transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            isPositive ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </button>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function AdminDashboard({ onNavigate }: Props) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const { data: stats, isLoading: statsLoading, refetch } = useAdminStats();
  const { data: chartData, isLoading: chartLoading } = useAdminRevenueChart(period);
  const { data: categoryData } = useAdminCategoryBreakdown();

  const formattedChart = chartData?.map(d => ({
    ...d,
    dateLabel: format(new Date(d.date), period === "1y" ? "MMM" : "MMM d"),
    revM: d.revenue / 1_000_000,
  })) ?? [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm">Real-time metrics across Uganda, Kenya & Tanzania</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/30 border border-green-800/50 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            All Systems Operational
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Today's Highlights */}
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-800/40 rounded-2xl p-4">
        <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-3">Today's Activity</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "New Users", value: stats?.newUsersToday ?? 0, icon: "👤" },
            { label: "New Listings", value: stats?.newListingsToday ?? 0, icon: "📦" },
            { label: "Orders", value: stats?.ordersToday ?? 0, icon: "🛒" },
            { label: "Revenue", value: `UGX ${fmt(stats?.revenueToday ?? 0)}`, icon: "💰" },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xl font-black text-white">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={fmt(stats?.totalUsers ?? 0)} change={stats?.userGrowth} icon={Users} color="bg-blue-600" onClick={() => onNavigate("admin-users")} />
        <StatCard label="Active Listings" value={fmt(stats?.activeListings ?? 0)} change={stats?.listingGrowth} icon={Package} color="bg-purple-600" onClick={() => onNavigate("admin-listings")} />
        <StatCard label="Total Orders" value={fmt(stats?.totalOrders ?? 0)} change={stats?.orderGrowth} icon={ShoppingCart} color="bg-orange-600" onClick={() => onNavigate("admin-orders")} />
        <StatCard label="Total Revenue" value={`UGX ${fmt(stats?.totalRevenue ?? 0)}`} change={stats?.revenueGrowth} icon={DollarSign} color="bg-green-600" onClick={() => onNavigate("admin-analytics")} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sellers" value={fmt(stats?.totalSellers ?? 0)} icon={Star} color="bg-yellow-600" onClick={() => onNavigate("admin-users")} />
        <StatCard label="WhatsApp Leads" value={fmt(stats?.totalWhatsAppLeads ?? 0)} icon={MessageCircle} color="bg-teal-600" />
        <StatCard label="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} icon={TrendingUp} color="bg-indigo-600" />
        <StatCard label="All Listings" value={fmt(stats?.totalListings ?? 0)} icon={Eye} color="bg-pink-600" onClick={() => onNavigate("admin-listings")} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-white">Revenue & Orders</h2>
            <p className="text-xs text-gray-400">Platform earnings over time (UGX millions)</p>
          </div>
          <div className="flex gap-1 bg-gray-800 p-1 rounded-xl">
            {(["7d", "30d", "90d", "1y"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={formattedChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="dateLabel" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }}
                formatter={(v: unknown, name: unknown) => [
                  name === "revM" ? `UGX ${(v as number).toFixed(1)}M` : (v as number).toLocaleString(),
                  name === "revM" ? "Revenue" : "Orders"
                ]}
              />
              <Area type="monotone" dataKey="revM" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" name="revM" />
              <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} fill="url(#ordGrad)" name="orders" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">Listings by Category</h2>
          <div className="flex gap-4">
            <ResponsiveContainer width="45%" height={180}>
              <PieChart>
                <Pie data={categoryData ?? []} dataKey="count" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {(categoryData ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }} formatter={(v: unknown) => [fmt(v as number), "Listings"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {(categoryData ?? []).map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-300">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{fmt(cat.count)}</span>
                    <span className="text-gray-500 ml-1">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Revenue */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">Subscription Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[
                { plan: "Free", users: 28400, color: "#6b7280" },
                { plan: "Individual", users: 9800, color: "#7c3aed" },
                { plan: "Starter", users: 6200, color: "#2563eb" },
                { plan: "Pro", users: 3100, color: "#f97316" },
                { plan: "Enterprise", users: 820, color: "#eab308" },
              ]}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="plan" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }} formatter={(v: unknown) => [(v as number).toLocaleString(), "Users"]} />
              <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                {[
                  { plan: "Free", users: 28400, color: "#6b7280" },
                  { plan: "Individual", users: 9800, color: "#7c3aed" },
                  { plan: "Starter", users: 6200, color: "#2563eb" },
                  { plan: "Pro", users: 3100, color: "#f97316" },
                  { plan: "Enterprise", users: 820, color: "#eab308" },
                ].map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { icon: "👤", text: "New user registered: Grace Atim (+256 702 345 678)", time: "2 min ago", type: "user" },
            { icon: "📦", text: "New listing pending review: Honda Fit 2019 – Kampala", time: "5 min ago", type: "listing" },
            { icon: "💰", text: "Payment received: UGX 50,000 (Starter plan – MTN MoMo)", time: "8 min ago", type: "payment" },
            { icon: "⚠️", text: "Listing reported: Samsung Galaxy S24 Ultra by usr_06", time: "12 min ago", type: "report" },
            { icon: "✅", text: "Seller verified: SnapPro Studios (ID verification)", time: "18 min ago", type: "verify" },
            { icon: "🛒", text: "Order completed: CC-2024-001234 – MacBook Pro M2", time: "25 min ago", type: "order" },
          ].map((act, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
              <span className="text-base shrink-0">{act.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 leading-snug">{act.text}</p>
              </div>
              <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
