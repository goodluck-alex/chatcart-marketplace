import { useState } from "react";
import { Search, Shield, ShieldOff, Ban, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminUsers, useAdminBanUser, useAdminVerifyUser } from "../lib/hooks";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { User } from "../lib/types";

const planColors: Record<string, string> = {
  free: "bg-gray-700 text-gray-300",
  individual: "bg-blue-900/60 text-blue-300",
  starter: "bg-purple-900/60 text-purple-300",
  pro: "bg-orange-900/60 text-orange-300",
  enterprise: "bg-yellow-900/60 text-yellow-300",
};
const roleColors: Record<string, string> = {
  buyer: "bg-gray-700 text-gray-300",
  seller: "bg-blue-900/60 text-blue-300",
  business: "bg-purple-900/60 text-purple-300",
  admin: "bg-red-900/60 text-red-300",
  superadmin: "bg-red-900/80 text-red-200",
};

export default function AdminUsers() {
  const [filters, setFilters] = useState({ query: "", page: 1, limit: 20, role: "", plan: "" });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  const { data, isLoading, refetch } = useAdminUsers({ ...filters, page: filters.page } as Parameters<typeof useAdminUsers>[0]);
  const banUser = useAdminBanUser();
  const verifyUser = useAdminVerifyUser();

  const handleBan = async (user: User) => {
    if (!banReason) { toast.error("Please provide a ban reason"); return; }
    await banUser.mutateAsync({ id: user.id, reason: banReason });
    toast.success(`${user.firstName} ${user.lastName} has been banned`);
    setSelectedUser(null);
    setBanReason("");
    refetch();
  };

  const handleVerify = async (user: User) => {
    await verifyUser.mutateAsync(user.id);
    toast.success(`${user.firstName} ${user.lastName} verified!`);
    refetch();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-gray-400 text-sm">{data?.meta.total.toLocaleString() ?? "—"} total users</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          + Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={filters.query}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value, page: 1 }))}
            placeholder="Search name, phone, email..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={filters.role}
          onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Roles</option>
          {["buyer", "seller", "business", "admin", "superadmin"].map(r => (
            <option key={r} value={r} className="capitalize">{r}</option>
          ))}
        </select>
        <select
          value={filters.plan}
          onChange={e => setFilters(f => ({ ...f, plan: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Plans</option>
          {["free", "individual", "starter", "pro", "enterprise"].map(p => (
            <option key={p} value={p} className="capitalize">{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["User", "Phone", "Role", "Plan", "Listings", "Rating", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: `${40 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.items.map(user => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email ?? user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${roleColors[user.role] ?? "bg-gray-700 text-gray-300"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${planColors[user.subscriptionPlan] ?? "bg-gray-700 text-gray-300"}`}>
                      {user.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 text-center">{user.totalListings}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">⭐ {user.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(user.joinedAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {user.isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Unverified</span>
                      )}
                      {user.isBanned && (
                        <span className="text-xs text-red-400 font-medium bg-red-900/30 px-1.5 py-0.5 rounded">Banned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!user.isVerified && !user.isBanned && (
                        <button
                          onClick={() => handleVerify(user)}
                          className="w-7 h-7 rounded-lg bg-blue-900/40 text-blue-400 hover:bg-blue-900/70 flex items-center justify-center transition-colors"
                          title="Verify"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!user.isBanned ? (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="w-7 h-7 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/70 flex items-center justify-center transition-colors"
                          title="Ban"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button className="w-7 h-7 rounded-lg bg-green-900/40 text-green-400 hover:bg-green-900/70 flex items-center justify-center transition-colors" title="Unban">
                          <ShieldOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-400">
              Showing {((data.meta.page - 1) * data.meta.limit) + 1}–{Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total.toLocaleString()}
            </p>
            <div className="flex gap-1">
              <button
                disabled={!data.meta.hasPrevPage}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center disabled:opacity-40 hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                {data.meta.page}
              </span>
              <button
                disabled={!data.meta.hasNextPage}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center disabled:opacity-40 hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-white mb-1">Ban User</h3>
            <p className="text-gray-400 text-sm mb-4">Banning <strong className="text-white">{selectedUser.firstName} {selectedUser.lastName}</strong> will prevent them from accessing ChatCart.</p>
            <textarea
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              placeholder="Enter reason for ban..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setSelectedUser(null); setBanReason(""); }} className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm">Cancel</button>
              <button onClick={() => handleBan(selectedUser)} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm">Ban User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
