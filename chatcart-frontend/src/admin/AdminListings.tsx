import { useState } from "react";
import { Search, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight, Eye, Shield } from "lucide-react";
import { useAdminListings, useAdminApproveListing, useAdminRejectListing } from "../lib/hooks";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  active: "bg-green-900/50 text-green-400",
  pending_review: "bg-yellow-900/50 text-yellow-400",
  draft: "bg-gray-700 text-gray-400",
  suspended: "bg-red-900/50 text-red-400",
  sold: "bg-blue-900/50 text-blue-400",
};

const categoryIcons: Record<string, string> = {
  Products: "🛍", Property: "🏠", Vehicles: "🚗", Stays: "🛏", Services: "🔧", "Quick Sell": "📦",
};

export default function AdminListings() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, query: "", category: "", status: "" });
  const { data, isLoading, refetch } = useAdminListings(filters as Parameters<typeof useAdminListings>[0]);
  const approve = useAdminApproveListing();
  const reject = useAdminRejectListing();
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (id: string, title: string) => {
    await approve.mutateAsync(id);
    toast.success(`"${title}" approved!`);
    refetch();
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason) { toast.error("Please provide a rejection reason"); return; }
    await reject.mutateAsync({ id: rejectModal.id, reason: rejectReason });
    toast.success("Listing rejected");
    setRejectModal(null);
    setRejectReason("");
    refetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Listing Management</h1>
          <p className="text-gray-400 text-sm">{data?.meta.total.toLocaleString() ?? "—"} total listings</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-yellow-900/40 border border-yellow-800/50 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-xl">
            ⏳ Pending Review: {data?.items.filter(l => l.status === "pending_review").length ?? 0}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={filters.query}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value, page: 1 }))}
            placeholder="Search listings..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Categories</option>
          {Object.keys(categoryIcons).map(c => (
            <option key={c} value={c}>{categoryIcons[c]} {c}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Status</option>
          {["active", "pending_review", "draft", "suspended", "sold"].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["Listing", "Category", "Price", "Seller", "Views", "Leads", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.items.map(listing => (
                <tr key={listing.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                        <img src={listing.thumbnail} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate max-w-40">{listing.title}</p>
                        <p className="text-xs text-gray-500">{listing.location.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{categoryIcons[listing.category]} {listing.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-purple-400 whitespace-nowrap">
                    UGX {listing.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {listing.seller.firstName[0]}
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">{listing.seller.firstName} {listing.seller.lastName}</p>
                        {listing.seller.isVerified && <Shield className="w-3 h-3 text-blue-400 inline" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 text-center">
                    <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400 text-center font-bold">{listing.whatsappLeads}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[listing.status] ?? "bg-gray-700 text-gray-400"}`}>
                      {listing.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(listing.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {listing.status === "pending_review" && (
                        <button
                          onClick={() => handleApprove(listing.id, listing.title)}
                          className="w-7 h-7 rounded-lg bg-green-900/40 text-green-400 hover:bg-green-900/70 flex items-center justify-center transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setRejectModal({ id: listing.id, title: listing.title })}
                        className="w-7 h-7 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/70 flex items-center justify-center transition-colors"
                        title="Reject/Suspend"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      {!listing.isFeatured && (
                        <button
                          className="w-7 h-7 rounded-lg bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/70 flex items-center justify-center transition-colors"
                          title="Feature"
                        >
                          <Star className="w-3.5 h-3.5" />
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
              <button disabled={!data.meta.hasPrevPage} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center disabled:opacity-40 hover:bg-gray-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">{data.meta.page}</span>
              <button disabled={!data.meta.hasNextPage} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center disabled:opacity-40 hover:bg-gray-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-white mb-1">Reject Listing</h3>
            <p className="text-gray-400 text-sm mb-4">Rejecting: <strong className="text-white">{rejectModal.title}</strong></p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm">Cancel</button>
              <button onClick={handleReject} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
