import { useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useListings } from "../lib/hooks";
import type { Category } from "../lib/types";
import ListingCard from "../components/ListingCard";

const categories = [
  { id: "all", label: "All", icon: "🏪" },
  { id: "Products",   label: "Products",   icon: "🛍" },
  { id: "Property",   label: "Property",   icon: "🏠" },
  { id: "Vehicles",   label: "Vehicles",   icon: "🚗" },
  { id: "Stays",      label: "Stays",      icon: "🛏" },
  { id: "Services",   label: "Services",   icon: "🔧" },
  { id: "Quick Sell", label: "Quick Sell", icon: "📦" },
];

const locations = ["all","Kampala","Entebbe","Jinja","Mbarara","Masaka","Kiwatule","Nakawa","Muyenga"];

interface Props {
  onNavigate: (page: string, data?: unknown) => void;
  searchQuery: string;
  activeCategory?: string;
}

export default function ListingsPage({ onNavigate, searchQuery }: Props) {
  const [category, setCategory]               = useState("all");
  const [sortBy, setSortBy]                   = useState<"newest"|"price_asc"|"price_desc"|"rating"|"popular">("popular");
  const [showFilters, setShowFilters]         = useState(false);
  const [priceMin, setPriceMin]               = useState("");
  const [priceMax, setPriceMax]               = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [verifiedOnly, setVerifiedOnly]       = useState(false);
  const [localSearch, setLocalSearch]         = useState(searchQuery);
  const [page, setPage]                       = useState(1);

  const { data, isLoading } = useListings({
    category:        category === "all" ? undefined : category as Category,
    query:           localSearch || searchQuery || undefined,
    city:            selectedLocation === "all" ? undefined : selectedLocation,
    minPrice:        priceMin ? parseInt(priceMin) : undefined,
    maxPrice:        priceMax ? parseInt(priceMax) : undefined,
    sellerVerified:  verifiedOnly || undefined,
    sortBy,
    page,
    limit: 16,
  });

  const clearFilters = () => {
    setPriceMin(""); setPriceMax(""); setVerifiedOnly(false);
    setSelectedLocation("all"); setLocalSearch(""); setPage(1);
  };

  const hasFilters = priceMin || priceMax || verifiedOnly || selectedLocation !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Browse Listings</h1>
        <p className="text-gray-500 text-sm">
          {isLoading ? "Loading..." : `${data?.meta.total.toLocaleString() ?? 0} listings found`}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search listings..."
          value={localSearch}
          onChange={e => { setLocalSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {localSearch && (
          <button onClick={() => setLocalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              category === cat.id
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
            showFilters ? "bg-purple-600 text-white border-purple-600" : "bg-white border-gray-200 text-gray-700 hover:border-purple-300"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {hasFilters && <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">!</span>}
        </button>

        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>

        <select
          value={selectedLocation}
          onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
        >
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc === "all" ? "All Locations" : loc}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer hover:border-purple-300">
          <input type="checkbox" checked={verifiedOnly} onChange={e => { setVerifiedOnly(e.target.checked); setPage(1); }} className="accent-purple-600" />
          Verified only
        </label>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 font-medium hover:text-red-700 px-2 py-2">
            <X className="w-4 h-4" /> Clear filters
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Min Price (UGX)</label>
            <input type="number" placeholder="e.g. 100000" value={priceMin} onChange={e => { setPriceMin(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Max Price (UGX)</label>
            <input type="number" placeholder="e.g. 5000000" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No listings found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters}
            className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-purple-700 transition-colors">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {data.items.map(l => (
              <ListingCard key={l.id} listing={l} onView={(id) => onNavigate("listing", id)} />
            ))}
          </div>

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={!data.meta.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40 hover:border-purple-300 transition-colors"
              >
                ← Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-purple-600 text-white" : "border border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40 hover:border-purple-300 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
