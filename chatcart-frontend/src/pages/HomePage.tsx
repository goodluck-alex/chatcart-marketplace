import { useState } from "react";
import { ChevronRight, TrendingUp, ArrowRight, Star } from "lucide-react";
import { useListings, useFeaturedListings, useRecommendations } from "../lib/hooks";
import ListingCard from "../components/ListingCard";
import type { Category } from "../lib/types";

const categories = [
  { id: "all",        label: "All",        icon: "🏪", grad: "from-gray-400 to-gray-500" },
  { id: "Products",   label: "Products",   icon: "🛍", grad: "from-blue-500 to-cyan-500",     desc: "12,400+ listings" },
  { id: "Property",   label: "Property",   icon: "🏠", grad: "from-green-500 to-emerald-500", desc: "3,820+ listings"  },
  { id: "Vehicles",   label: "Vehicles",   icon: "🚗", grad: "from-orange-500 to-amber-500",  desc: "5,610+ listings"  },
  { id: "Stays",      label: "Stays",      icon: "🛏", grad: "from-pink-500 to-rose-500",     desc: "1,890+ listings"  },
  { id: "Services",   label: "Services",   icon: "🔧", grad: "from-teal-500 to-cyan-600",     desc: "7,340+ listings"  },
  { id: "Quick Sell", label: "Quick Sell", icon: "📦", grad: "from-yellow-500 to-orange-500", desc: "9,200+ listings"  },
];



interface Props { onNavigate: (page: string, data?: unknown) => void; searchQuery: string; }

export default function HomePage({ onNavigate, searchQuery }: Props) {
  const [activeCat, setActiveCat] = useState("all");

  const { data: featuredData, isLoading: featLoading } = useFeaturedListings(4);
  const { data: listingsData, isLoading: listLoading } = useListings({
    category: activeCat === "all" ? undefined : activeCat as Category,
    query: searchQuery || undefined,
    limit: 8, sortBy: "popular",
  });
  const { data: freshData, isLoading: freshLoading } = useRecommendations({
    category: activeCat === "all" ? undefined : activeCat as Category,
    query: searchQuery || undefined,
    limit: 4,
  });
  const { data: nearbyData, isLoading: nearbyLoading } = useRecommendations({
    category: activeCat === "all" ? undefined : activeCat as Category,
    query: searchQuery || undefined,
    city: "Kampala",
    limit: 4,
  });
  const { data: relatedData, isLoading: relatedLoading } = useRecommendations({
    category: activeCat === "all" ? undefined : activeCat as Category,
    query: searchQuery || undefined,
    limit: 4,
  });

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl overflow-hidden" style={{ border: "1px solid #f3f0ff" }}>
      <div className="aspect-[4/3] skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-9 w-full rounded-2xl mt-3" />
      </div>
    </div>
  );

  return (
    <div className="pb-24 md:pb-0">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #4f46e5 100%)" }}>

        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
          {/* Floating emojis */}
          {["🏠","🚗","📱","🛏","🔧","📦","🛍"].map((e, i) => (
            <span key={i} className="absolute text-3xl select-none pointer-events-none"
              style={{ left: `${6 + i * 13}%`, top: `${15 + (i % 3) * 30}%`, opacity: 0.12,
                animation: `float ${3 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
              {e}
            </span>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">

            {/* Left */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)" }}>
                <span className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
                Africa's #1 WhatsApp Marketplace
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight mb-5">
                Sell anything<br />
                <span style={{ color: "#fde68a" }}>in minutes</span>
              </h1>

              <p className="text-purple-100 text-lg mb-8 max-w-md leading-relaxed">
                Reach thousands of buyers near you. Buy, sell, rent, book & hire — all through WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button onClick={() => onNavigate("sell")}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-base transition-all"
                  style={{ background: "rgba(255,255,255,1)", color: "#7c3aed", boxShadow: "0 8px 24px rgba(0,0,0,.2)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fde68a"; (e.currentTarget as HTMLButtonElement).style.color = "#5b21b6"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,1)"; (e.currentTarget as HTMLButtonElement).style.color = "#7c3aed"; }}>
                  <span className="text-xl">+</span> Sell Now
                </button>
                <button onClick={() => onNavigate("listings")}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all"
                  style={{ border: "2px solid rgba(255,255,255,.35)", color: "#fff" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.12)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
                  Browse Listings <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-9 justify-center md:justify-start">
                {[{ v: "40K+", l: "Active Listings" }, { v: "8,500+", l: "Verified Sellers" }, { v: "12", l: "Cities" }].map(s => (
                  <div key={s.l}>
                    <div className="text-2xl font-black" style={{ color: "#fde68a" }}>{s.v}</div>
                    <div className="text-xs text-purple-200 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Phone mockup */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="relative float">
                {/* Phone shell */}
                <div className="w-56 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl" style={{ border: "4px solid #374151" }}>
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-gray-900 text-white text-[10px] flex justify-between px-4 py-1.5">
                      <span className="font-semibold">9:41</span><span>●●●</span>
                    </div>
                    {/* App header */}
                    <div className="text-white px-3 py-2.5" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                      <p className="text-[9px] opacity-75">Good morning, Alex 👋</p>
                      <p className="text-[10px] font-bold">What are you looking for?</p>
                      <div className="mt-1.5 bg-white/20 rounded-lg px-2 py-1 text-[9px] text-white/70">🔍 Search anything…</div>
                    </div>
                    {/* Categories grid */}
                    <div className="p-2">
                      <p className="text-[9px] font-black text-gray-700 mb-1.5">Categories</p>
                      <div className="grid grid-cols-3 gap-1">
                        {categories.slice(1).map(c => (
                          <div key={c.id} className="bg-gray-50 rounded-xl p-1.5 text-center">
                            <div className="text-lg">{c.icon}</div>
                            <div className="text-[7px] font-semibold text-gray-600 mt-0.5 leading-tight">{c.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Bottom nav */}
                    <div className="border-t flex justify-around py-2 px-2">
                      {["🏠","🔍","➕","💬","👤"].map((icon, i) => (
                        <span key={i} className={`text-base ${i === 0 ? "opacity-100" : "opacity-30"}`}>{icon}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WhatsApp badge */}
                <div className="absolute -right-8 top-1/4 flex items-center gap-2 text-white text-[11px] font-black px-3 py-2 rounded-2xl shadow-xl"
                  style={{ background: "#25D366", animation: "float 3.5s ease-in-out infinite", animationDelay: "0.5s" }}>
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Buy on WhatsApp
                </div>

                {/* Rating badge */}
                <div className="absolute -left-8 bottom-1/4 flex items-center gap-1.5 bg-white text-[11px] font-black px-2.5 py-1.5 rounded-2xl"
                  style={{ boxShadow: "0 8px 24px rgba(0,0,0,.15)", animation: "float 4s ease-in-out infinite", animationDelay: "1s" }}>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-gray-800">4.9 Top Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎯", t: "One Account",    d: "Buy, sell, rent or offer services"  },
              { icon: "💬", t: "WhatsApp-First",  d: "Chat and close deals instantly"     },
              { icon: "🛡", t: "Secure & Trusted",d: "Verified users and reviews"          },
              { icon: "⚡", t: "Simple & Fast",   d: "Designed for everyone"               },
            ].map(f => (
              <div key={f.t} className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-purple-50/60 cursor-default">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{f.t}</p>
                  <p className="text-xs text-gray-500">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 py-8">

        {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
        <section>
          <div className="cc-section-header">
            <h2 className="cc-section-title">What are you looking for?</h2>
            <button onClick={() => onNavigate("listings")}
              className="flex items-center gap-1 text-sm font-semibold transition-all hover:gap-2"
              style={{ color: "#7c3aed" }}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.slice(1).map(cat => (
              <button key={cat.id} onClick={() => { setActiveCat(cat.id); onNavigate("listings"); }}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-3xl bg-white transition-all"
                style={{ border: "1.5px solid #f3f0ff", boxShadow: "0 2px 8px rgba(124,58,237,.06)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#c4b5fd";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(124,58,237,.15)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#f3f0ff";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(124,58,237,.06)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.grad} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {cat.icon}
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-bold text-gray-800">{cat.label}</p>
                  <p className="text-[10px] text-gray-400">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── FEATURED LISTINGS ─────────────────────────────────────────────── */}
        <section>
          <div className="cc-section-header">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg,#fde68a,#f97316)" }}>⭐</div>
              <h2 className="cc-section-title">Featured Listings</h2>
            </div>
            <button onClick={() => onNavigate("listings")}
              className="flex items-center gap-1 text-sm font-semibold transition-all hover:gap-2"
              style={{ color: "#7c3aed" }}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredData?.map(l => (
                  <ListingCard key={l.id} listing={l} onView={id => onNavigate("listing", id)} />
                ))}
          </div>
        </section>

        {/* ── BROWSE WITH FILTERS ───────────────────────────────────────────── */}
        <section>
          <div className="cc-section-header">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "#7c3aed" }} />
              <h2 className="cc-section-title">Popular Near You</h2>
            </div>
            <button onClick={() => onNavigate("listings")}
              className="flex items-center gap-1 text-sm font-semibold transition-all hover:gap-2"
              style={{ color: "#7c3aed" }}>
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all shrink-0"
                style={activeCat === cat.id
                  ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", boxShadow: "0 4px 12px rgba(124,58,237,.3)" }
                  : { background: "#fff", color: "#4b5563", border: "1.5px solid #f3f0ff" }}>
                <span>{cat.icon}</span><span>{cat.label}</span>
              </button>
            ))}
          </div>

          {listLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !listingsData?.items.length ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-bold text-gray-700 text-lg">No listings found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listingsData.items.map(l => (
                <ListingCard key={l.id} listing={l} onView={id => onNavigate("listing", id)} compact />
              ))}
            </div>
          )}
        </section>

        {/* ── SMART DISCOVERY ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="cc-section-header">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)" }}>✨</div>
              <h2 className="cc-section-title">Smart picks for you</h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-black text-gray-900">Freshly added</p>
                  <p className="text-xs text-gray-500">New listings that just arrived</p>
                </div>
                <span className="text-xs font-semibold text-purple-600">New</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(freshLoading ? Array.from({ length: 4 }) : freshData ?? []).map((listing, index) => (
                  <div key={listing?.id ?? index} className="rounded-2xl bg-white p-2.5 border border-purple-100">
                    <div className="text-[11px] font-semibold text-purple-600 mb-1">{listing?.location?.city ?? "Near you"}</div>
                    <div className="font-semibold text-sm text-gray-800 line-clamp-2">{listing?.title ?? "Loading..."}</div>
                    <div className="text-xs text-gray-500 mt-1">UGX {listing?.price?.toLocaleString() ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-black text-gray-900">Popular near you</p>
                  <p className="text-xs text-gray-500">Highly viewed listings in Kampala</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600">Local</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(nearbyLoading ? Array.from({ length: 4 }) : nearbyData ?? []).map((listing, index) => (
                  <div key={listing?.id ?? index} className="rounded-2xl bg-white p-2.5 border border-emerald-100">
                    <div className="text-[11px] font-semibold text-emerald-600 mb-1">{listing?.category ?? "Local"}</div>
                    <div className="font-semibold text-sm text-gray-800 line-clamp-2">{listing?.title ?? "Loading..."}</div>
                    <div className="text-xs text-gray-500 mt-1">{listing?.views ?? 0} views</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-black text-gray-900">Related to {activeCat === "all" ? "your browse" : activeCat}</p>
                <p className="text-xs text-gray-500">Curated picks from the same category</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(relatedLoading ? Array.from({ length: 4 }) : relatedData ?? []).map((listing, index) => (
                <div key={listing?.id ?? index} className="rounded-2xl border border-gray-100 p-3 bg-gray-50">
                  <div className="text-[11px] font-semibold text-gray-500 mb-1">{listing?.category ?? "Listing"}</div>
                  <div className="font-semibold text-sm text-gray-800 line-clamp-2">{listing?.title ?? "Loading..."}</div>
                  <div className="text-xs text-gray-500 mt-1">UGX {listing?.price?.toLocaleString() ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">How ChatCart Works</h2>
            <p className="text-gray-500">4 simple steps to buy or sell anything</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n:"1", icon:"📱", t:"Browse or Post",    d:"Find what you need or list what you have",  grad:"from-purple-100 to-indigo-100", ib:"from-purple-500 to-indigo-600" },
              { n:"2", icon:"💬", t:"Chat on WhatsApp",  d:"Connect with buyers or sellers instantly",  grad:"from-green-100 to-emerald-100",  ib:"from-green-500 to-emerald-600"  },
              { n:"3", icon:"🤝", t:"Agree & Pay",       d:"Negotiate, agree and make payment",          grad:"from-blue-100 to-cyan-100",      ib:"from-blue-500 to-cyan-600"      },
              { n:"4", icon:"📦", t:"Deliver & Review",  d:"Receive your item and leave a review",       grad:"from-orange-100 to-amber-100",   ib:"from-orange-500 to-amber-600"   },
            ].map(s => (
              <div key={s.n} className={`bg-gradient-to-br ${s.grad} rounded-3xl p-5 text-center relative overflow-hidden`}
                style={{ border: "1px solid rgba(255,255,255,.6)" }}>
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-xs font-black text-gray-700">{s.n}</div>
                <div className={`w-14 h-14 bg-gradient-to-br ${s.ib} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg`}>{s.icon}</div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{s.t}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORY SHOWCASE ─────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-7">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Explore All Categories</h2>
            <p className="text-gray-500">Across Uganda, Kenya, Tanzania & more</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon:"🛍", t:"Products",   d:"Shop everything",         c:"12,400+", img:"https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=400",  grad:"from-blue-700/90 to-indigo-800/90"    },
              { icon:"🏠", t:"Property",   d:"Buy, sell or rent",       c:"3,820+",  img:"https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=400", grad:"from-green-700/90 to-emerald-800/90"  },
              { icon:"🚗", t:"Vehicles",   d:"Cars, bikes & more",      c:"5,610+",  img:"https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=400", grad:"from-orange-700/90 to-amber-800/90"   },
              { icon:"🛏", t:"Stays",      d:"Short stays & getaways",  c:"1,890+",  img:"https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=400",  grad:"from-pink-700/90 to-rose-800/90"     },
              { icon:"🔧", t:"Services",   d:"Find trusted experts",    c:"7,340+",  img:"https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=400", grad:"from-teal-700/90 to-cyan-800/90"     },
              { icon:"📦", t:"Quick Sell", d:"Sell single items fast",  c:"9,200+",  img:"https://images.pexels.com/photos/6214386/pexels-photo-6214386.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=400", grad:"from-yellow-700/90 to-orange-800/90" },
            ].map(cat => (
              <button key={cat.t} onClick={() => onNavigate("listings")}
                className="group relative rounded-3xl overflow-hidden h-40 md:h-48 text-left transition-all"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,.12)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(0,0,0,.25)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.12)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}>
                <img src={cat.img} alt={cat.t} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.grad}`} />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-white font-black text-lg">{cat.t}</span>
                  </div>
                  <p className="text-white/80 text-xs">{cat.d}</p>
                  <p className="text-yellow-300 text-xs font-bold mt-1">{cat.c} listings</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── TRUST SECTION ─────────────────────────────────────────────────── */}
        <section className="rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#5b21b6,#7c3aed,#4f46e5)" }}>
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-2">Why Buyers & Sellers Love ChatCart</h2>
              <p className="text-purple-200 text-sm">Trusted by thousands every day</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon:"🛡", t:"Secure Transactions", d:"Your safety is our priority" },
                { icon:"👥", t:"Trusted Community",    d:"Verified sellers and buyers" },
                { icon:"⭐", t:"4.8/5 Rating",          d:"Top rated marketplace" },
                { icon:"🌍", t:"Across East Africa",   d:"Uganda, Kenya, Tanzania" },
              ].map(item => (
                <div key={item.t} className="text-center p-4 rounded-2xl" style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)" }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{item.t}</div>
                  <div className="text-purple-200 text-xs">{item.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── APP DOWNLOAD CTA ──────────────────────────────────────────────── */}
        <section className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)" }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          </div>
          <div className="relative px-8 py-12 text-center">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-2xl font-black text-white mb-2">Get the ChatCart App</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Available on Android & iOS. Post listings in seconds from your phone.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {[
                { emoji: "▶", sub: "GET IT ON", main: "Google Play" },
                { emoji: "🍎", sub: "Download on the", main: "App Store" },
              ].map(btn => (
                <button key={btn.main}
                  className="flex items-center gap-3 bg-white text-gray-900 font-bold px-6 py-3.5 rounded-2xl hover:bg-gray-100 transition-all"
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
                  <span className="text-2xl">{btn.emoji}</span>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500 font-medium">{btn.sub}</div>
                    <div className="font-black text-sm">{btn.main}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
