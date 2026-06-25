import { Heart, MapPin, Star, Eye, Shield, Zap } from "lucide-react";
import { useState } from "react";
import type { Listing } from "../lib/types";
import { useTrackWhatsAppClick } from "../lib/hooks";
import { config } from "../lib/config";

interface ListingCardProps {
  listing: Listing;
  onView: (id: string) => void;
  compact?: boolean;
}

const priceLabel: Record<string, string> = {
  per_night: "/night", per_month: "/mo", per_hour: "/hr",
  fixed: "", negotiable: "", free: "",
};

const categoryEmoji: Record<string, string> = {
  Products: "🛍", Property: "🏠", Vehicles: "🚗",
  Stays: "🛏", Services: "🔧", "Quick Sell": "📦",
};

const categoryGrad: Record<string, string> = {
  Products: "from-blue-400 to-cyan-500",
  Property: "from-green-400 to-emerald-500",
  Vehicles: "from-orange-400 to-amber-500",
  Stays: "from-pink-400 to-rose-500",
  Services: "from-teal-400 to-cyan-600",
  "Quick Sell": "from-yellow-400 to-orange-500",
};

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ListingCard({ listing, onView, compact }: ListingCardProps) {
  const [liked, setLiked] = useState(listing.isWishlisted ?? false);
  const [imgErr, setImgErr] = useState(false);
  const trackWA = useTrackWhatsAppClick();

  const imgSrc = listing.thumbnail ?? listing.images[0]?.thumbnailUrl ?? listing.images[0]?.url;

  const handleWA = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackWA.mutate(listing.id);
    const phone = listing.store?.whatsappNumber ?? config.whatsappPhone;
    const suffix = priceLabel[listing.priceType] ?? "";
    const msg = encodeURIComponent(
      `Hello ${listing.seller.firstName} 👋\nI'm interested in:\n\n*${listing.title}*\nPrice: UGX ${listing.price.toLocaleString()}${suffix}\nLocation: ${listing.location.city}\n\nPlease provide more details.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const getBadge = () => {
    if (listing.priceType === "per_month") return { label: "For Rent",   bg: "#dbeafe", color: "#1d4ed8" };
    if (listing.priceType === "per_night") return { label: "Available",  bg: "#dcfce7", color: "#15803d" };
    if (listing.category === "Quick Sell") return { label: "Quick Sell", bg: "#ffedd5", color: "#c2410c" };
    if (listing.status === "sold")         return { label: "Sold",       bg: "#f3f4f6", color: "#4b5563" };
    return { label: "For Sale", bg: "#ede9fe", color: "#6d28d9" };
  };
  const badge = getBadge();

  return (
    <div
      onClick={() => onView(listing.id)}
      className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(124,58,237,.06)", border: "1px solid #f3f0ff" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(124,58,237,.16), 0 2px 8px rgba(0,0,0,.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(124,58,237,.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {!imgErr && imgSrc ? (
          <img src={imgSrc} alt={listing.title} onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${categoryGrad[listing.category] ?? "from-purple-400 to-indigo-500"} flex items-center justify-center`}>
            <span className="text-5xl drop-shadow">{categoryEmoji[listing.category] ?? "📦"}</span>
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <span className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>

        {/* Featured */}
        {listing.isFeatured && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-black text-white px-2 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
            <Zap className="w-2.5 h-2.5" /> FEATURED
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
          <Heart className={`w-3.5 h-3.5 transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-500"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Title + views */}
        <div className="flex items-start justify-between gap-1.5 mb-1">
          <h3 className="font-bold text-gray-900 text-[13px] leading-snug line-clamp-2 flex-1">
            {listing.title}
          </h3>
          <div className="flex items-center gap-0.5 text-gray-400 shrink-0 mt-0.5">
            <Eye className="w-3 h-3" />
            <span className="text-[10px]">{listing.views > 999 ? `${(listing.views/1000).toFixed(1)}k` : listing.views}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-base font-black" style={{ color: "#7c3aed" }}>
            UGX {listing.price.toLocaleString()}
          </span>
          {priceLabel[listing.priceType] && (
            <span className="text-[11px] text-gray-400 font-medium">{priceLabel[listing.priceType]}</span>
          )}
          {listing.priceType === "negotiable" && (
            <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">nego</span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 mb-2.5">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-[11px] font-medium truncate">{listing.location.city}</span>
          {listing.condition && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-[11px] font-medium capitalize text-gray-400">
                {listing.condition.replace("_", " ")}
              </span>
            </>
          )}
        </div>

        {/* Seller row (non-compact) */}
        {!compact && (
          <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-gray-100">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
              {listing.seller.firstName[0]}
            </div>
            <span className="text-[11px] font-semibold text-gray-700 truncate flex-1">
              {listing.store?.name ?? `${listing.seller.firstName} ${listing.seller.lastName}`}
            </span>
            {listing.seller.isVerified && <Shield className="w-3 h-3 text-blue-500 shrink-0" />}
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-gray-700">{listing.seller.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* WhatsApp button */}
        <button onClick={handleWA}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-white text-[13px] font-bold transition-all active:scale-95"
          style={{ background: "#25D366", boxShadow: "0 3px 12px rgba(37,211,102,.3)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#128C7E"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#25D366"; }}>
          <WAIcon />
          Buy on WhatsApp
        </button>
      </div>
    </div>
  );
}
