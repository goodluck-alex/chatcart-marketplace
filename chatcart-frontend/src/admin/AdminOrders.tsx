import { useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useAdminOrders } from "../lib/hooks";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-400",
  confirmed: "bg-blue-900/50 text-blue-400",
  in_progress: "bg-indigo-900/50 text-indigo-400",
  completed: "bg-green-900/50 text-green-400",
  cancelled: "bg-gray-700 text-gray-400",
  disputed: "bg-red-900/50 text-red-400",
};

const paymentColors: Record<string, string> = {
  pending: "text-yellow-400",
  completed: "text-green-400",
  failed: "text-red-400",
  refunded: "text-gray-400",
};

export default function AdminOrders() {
  const [filters, setFilters] = useState({ status: "", page: 1 });
  const { data, isLoading } = useAdminOrders(filters);

  const handleResolveDispute = (orderId: string) => {
    toast.success(`Dispute for order ${orderId} resolved`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Orders & Transactions</h1>
          <p className="text-gray-400 text-sm">{data?.meta.total.toLocaleString() ?? "—"} total orders</p>
        </div>
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 text-red-400 text-xs font-bold px-3 py-1.5 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5" />
          {data?.items.filter(o => o.status === "disputed").length ?? 0} Disputed
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", "pending", "in_progress", "completed", "disputed", "cancelled"].map(status => (
          <button
            key={status || "all"}
            onClick={() => setFilters(f => ({ ...f, status, page: 1 }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
              filters.status === status
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {status === "" ? "All Orders" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["Order #", "Listing", "Buyer", "Seller", "Amount", "Payment", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.items.map(order => (
                <tr key={order.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${order.status === "disputed" ? "bg-red-950/20" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono font-bold text-purple-400">{order.orderNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white max-w-32 truncate">{order.listing.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">{order.buyer.firstName} {order.buyer.lastName}</p>
                    <p className="text-xs text-gray-500">{order.buyer.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">{order.seller.firstName} {order.seller.lastName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white">UGX {order.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 capitalize">{order.paymentMethod.replace("_", " ")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold capitalize ${paymentColors[order.paymentStatus] ?? "text-gray-400"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[order.status] ?? "bg-gray-700 text-gray-400"}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "disputed" && (
                      <button
                        onClick={() => handleResolveDispute(order.orderNumber)}
                        className="text-xs bg-orange-900/40 text-orange-400 hover:bg-orange-900/70 px-2 py-1 rounded-lg transition-colors font-bold"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-400">
              Showing {data.items.length} of {data.meta.total.toLocaleString()} orders
            </p>
            <div className="flex gap-1">
              <button disabled={!data.meta.hasPrevPage} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center disabled:opacity-40 hover:bg-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">{data.meta.page}</span>
              <button disabled={!data.meta.hasNextPage} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center disabled:opacity-40 hover:bg-gray-700">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
