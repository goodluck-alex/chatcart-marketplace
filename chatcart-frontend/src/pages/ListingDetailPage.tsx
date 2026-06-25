import { useState } from "react";
import { ArrowLeft, Heart, Share2, MapPin, Star, Shield, Eye, Phone, Flag } from "lucide-react";
import { listings } from "../data/listings";

interface Props {
  listingId: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export default function ListingDetailPage({ listingId, onNavigate }: Props) {
  const listing = listings.find(l => l.id === listingId);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [reported, setReported] = useState(false);

  if (!listing) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <h3 className="font-bold text-gray-800 text-xl mb-2">Listing not found</h3>
        <button onClick={() => onNavigate("listings")} className="text-purple-600 font-semibold">← Back to listings</button>
      </div>
    );
  }

  const related = listings.filter(l => l.category === listing.category && l.id !== listing.id).slice(0, 4);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello ${listing.seller} 👋\nI'm interested in:\n\n*${listing.title}*\nPrice: ${listing.price}\nLocation: ${listing.location}\n\nPlease provide more details.`
    );
    window.open(`https://wa.me/${listing.sellerPhone}?text=${msg}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, text: listing.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-0 md:px-6 pb-32 md:pb-8">
      {/* Back button */}
      <div className="px-4 py-3 flex items-center justify-between md:py-4">
        <button
          onClick={() => onNavigate("listings")}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${liked ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-600"}`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-8">
        {/* Image Gallery */}
        <div className="relative">
          <div className="relative aspect-[4/3] md:rounded-2xl overflow-hidden bg-gray-100">
            {!imgError ? (
              <img
                src={listing.image}
                alt={listing.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">{listing.categoryIcon}</div>
            )}
            {/* Image counter */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              1/5
            </div>
            {/* Badges */}
            {listing.featured && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                ⭐ Featured
              </div>
            )}
            {listing.isNew && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                NEW
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          <div className="flex gap-2 p-4 md:px-0 overflow-x-auto">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${n === 1 ? 'border-purple-500' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                <img src={listing.image} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
              </div>
            ))}
          </div>
        </div>

        {/* Listing Info */}
        <div className="px-4 md:px-0">
          {/* Category + Views */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <span>{listing.categoryIcon}</span>
              {listing.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              {listing.views} views
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-2 leading-tight">{listing.title}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl md:text-3xl font-black text-purple-600">{listing.price}</span>
            {listing.badge && (
              <span className={`text-sm font-bold px-3 py-1 rounded-xl ${
                listing.badgeColor === "green" ? "bg-green-100 text-green-700" :
                listing.badgeColor === "blue" ? "bg-blue-100 text-blue-700" :
                listing.badgeColor === "purple" ? "bg-purple-100 text-purple-700" :
                "bg-orange-100 text-orange-700"
              }`}>
                {listing.badge}
              </span>
            )}
          </div>

          {/* Location & Time */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {listing.location}
            </span>
            <span>· {listing.timeAgo}</span>
          </div>

          {/* Seller Card */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                  {listing.seller[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">{listing.seller}</span>
                    {listing.sellerVerified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-700">{listing.sellerRating}</span>
                    <span>({listing.sellerReviews} reviews)</span>
                  </div>
                  {listing.sellerVerified && (
                    <span className="text-xs text-blue-600 font-medium">✓ Verified Seller</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowContact(!showContact)}
                className="text-sm text-purple-600 font-semibold bg-purple-50 px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors"
              >
                {showContact ? "Hide" : "View Contact"}
              </button>
            </div>
            {showContact && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-gray-800">+{listing.sellerPhone}</span>
                <a href={`tel:+${listing.sellerPhone}`} className="ml-auto">
                  <Phone className="w-4 h-4 text-gray-600" />
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {listing.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex flex-col gap-3">
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-green-200"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Buy on WhatsApp
            </button>
            <button
              onClick={() => alert("Save to wishlist!")}
              className="w-full border-2 border-purple-200 text-purple-700 font-bold py-3 rounded-2xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" /> Save to Wishlist
            </button>
          </div>

          {/* Report */}
          <button
            onClick={() => setReported(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors mt-4"
          >
            <Flag className="w-3 h-3" />
            {reported ? "Reported" : "Report this listing"}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="px-4 md:px-0 mt-8">
        <h2 className="text-lg font-black text-gray-900 mb-4">Seller Reviews</h2>
        <div className="grid gap-3">
          {[
            { name: "Sarah K.", rating: 5, text: "Great seller! Item exactly as described. Fast response on WhatsApp.", time: "2 days ago" },
            { name: "Moses O.", rating: 4, text: "Good experience. Seller was responsive. Item delivered in good condition.", time: "1 week ago" },
            { name: "Amina N.", rating: 5, text: "Very professional. Would definitely buy again from this store!", time: "2 weeks ago" },
          ].map((review, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white text-sm font-bold flex items-center justify-center">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.time}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Listings */}
      {related.length > 0 && (
        <div className="px-4 md:px-0 mt-8">
          <h2 className="text-lg font-black text-gray-900 mb-4">Similar Listings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map(l => (
              <div
                key={l.id}
                onClick={() => onNavigate("listing", l.id)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={l.image} alt={l.title} className="w-full h-full object-cover hover:scale-105 transition-transform" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-800 line-clamp-2">{l.title}</p>
                  <p className="text-xs text-purple-600 font-bold mt-1">{l.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile CTA Fixed Bottom */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-2xl md:hidden z-40">
        <button
          onClick={handleWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-200"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Buy on WhatsApp
        </button>
      </div>
    </div>
  );
}
