// ─── Mock Data Layer ───────────────────────────────────────────────────────────
// Mirrors exact API response shapes so swapping real endpoints is seamless.
// Remove this file when real backend is connected; all API hooks fall back here.

import type {
  User, Listing, Store, Order, Review, Notification,
  PlatformStats, RevenueDataPoint, CategoryBreakdown,
  WhatsAppLead,
} from "./types";

// ─── Users ────────────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: "usr_01",
  firstName: "Alex",
  lastName: "Mukasa",
  phone: "+256700000001",
  email: "alex@chatcart.africa",
  role: "seller",
  isVerified: true,
  verificationStatus: "verified",
  subscriptionPlan: "starter",
  subscriptionExpiresAt: "2025-12-31T23:59:59Z",
  country: "UG",
  city: "Kampala",
  bio: "Electronics dealer & tech enthusiast in Kampala",
  totalListings: 12,
  totalSales: 47,
  rating: 4.8,
  reviewCount: 120,
  joinedAt: "2023-06-15T10:00:00Z",
  lastSeenAt: new Date().toISOString(),
  deviceTokens: [],
  isActive: true,
  isBanned: false,
};

export const mockAdminUser: User = {
  ...mockUser,
  id: "usr_admin",
  firstName: "Sarah",
  lastName: "Admin",
  email: "admin@chatcart.africa",
  role: "superadmin",
  city: "Kampala",
};

// ─── Stores ───────────────────────────────────────────────────────────────────
export const mockStore: Store = {
  id: "str_01",
  userId: "usr_01",
  name: "Trendify Store",
  slug: "trendify-store",
  description: "Premium electronics and gadgets dealer in Uganda. Authorized reseller.",
  logo: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=80&w=80",
  whatsappNumber: "256700000001",
  address: "Kampala Road, Shop 14",
  city: "Kampala",
  country: "UG",
  categories: ["Products", "Quick Sell"],
  rating: 4.8,
  reviewCount: 120,
  totalListings: 12,
  totalSales: 47,
  isVerified: true,
  isFeatured: true,
  plan: "starter",
  planExpiresAt: "2025-12-31T23:59:59Z",
  followers: 342,
  createdAt: "2023-06-15T10:00:00Z",
  updatedAt: new Date().toISOString(),
};

// ─── Listings ─────────────────────────────────────────────────────────────────
const makeImage = (url: string, id: string) => ({
  id,
  url,
  thumbnailUrl: url,
  order: 0,
});

export const mockListings: Listing[] = [
  {
    id: "lst_01", title: "MacBook Pro M2 2022", slug: "macbook-pro-m2-2022",
    description: "MacBook Pro M2 chip, 512GB SSD, 8GB RAM. Excellent condition. With original charger and box. Only 3 months old.",
    price: 2500000, currency: "UGX", priceType: "fixed", category: "Products",
    images: [makeImage("https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_01")],
    thumbnail: "https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kampala", country: "UG", displayAddress: "Kampala, Uganda" },
    seller: mockUser, store: mockStore,
    status: "active", condition: "like_new",
    attributes: { brand: "Apple", model: "MacBook Pro", year: 2022, storage: "512GB", ram: "8GB" },
    tags: ["Apple", "Laptop", "MacBook"], views: 712, wishlistCount: 45, inquiryCount: 23, whatsappLeads: 18,
    isFeatured: true, isSponsored: false, createdAt: "2024-11-01T10:00:00Z", updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "lst_02", title: "2 Bedroom Apartment – Kiwatule", slug: "2br-apartment-kiwatule",
    description: "Spacious 2-bedroom apartment in Kiwatule. Fully tiled, modern kitchen, 24hr security, parking space. Water & security included.",
    price: 800000, currency: "UGX", priceType: "per_month", category: "Property",
    images: [makeImage("https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_02")],
    thumbnail: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kiwatule", country: "UG", displayAddress: "Kiwatule, Kampala" },
    seller: { ...mockUser, id: "usr_02", firstName: "Prime", lastName: "Homes" }, store: undefined,
    status: "active", attributes: { bedrooms: 2, bathrooms: 1, size_sqm: 75, type: "Apartment", listing_type: "For Rent" },
    tags: ["Apartment", "Kiwatule", "For Rent"], views: 342, wishlistCount: 28, inquiryCount: 15, whatsappLeads: 12,
    isFeatured: false, isSponsored: false, createdAt: "2024-10-20T08:00:00Z", updatedAt: "2024-10-20T08:00:00Z",
  },
  {
    id: "lst_03", title: "Toyota Premio 2018", slug: "toyota-premio-2018",
    description: "2018 Toyota Premio, 1500cc, automatic, full AC, music system, reverse camera. Clean & well maintained. Documents ready.",
    price: 28000000, currency: "UGX", priceType: "negotiable", category: "Vehicles",
    images: [makeImage("https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_03")],
    thumbnail: "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kampala", country: "UG" },
    seller: { ...mockUser, id: "usr_03", firstName: "AutoDeals", lastName: "Uganda" }, store: undefined,
    status: "active", condition: "good",
    attributes: { make: "Toyota", model: "Premio", year: 2018, mileage: 45000, engine: "1500cc", transmission: "Automatic" },
    tags: ["Toyota", "Sedan", "Premio"], views: 891, wishlistCount: 67, inquiryCount: 41, whatsappLeads: 35,
    isFeatured: true, isSponsored: true, createdAt: "2024-10-15T07:00:00Z", updatedAt: "2024-10-15T07:00:00Z",
  },
  {
    id: "lst_04", title: "Luxury Lake View Suite – Entebbe", slug: "luxury-lake-view-suite-entebbe",
    description: "Beautiful lake view suite in Entebbe. Pool, breakfast included, WiFi, AC. Perfect for couples and getaways.",
    price: 150000, currency: "UGX", priceType: "per_night", category: "Stays",
    images: [makeImage("https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_04")],
    thumbnail: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Entebbe", country: "UG" },
    seller: { ...mockUser, id: "usr_04", firstName: "Serena", lastName: "Stays" }, store: undefined,
    status: "active",
    attributes: { type: "Hotel", max_guests: 2, amenities: "Pool, WiFi, Breakfast, AC", check_in: "12:00 PM" },
    tags: ["Hotel", "Lake View", "Entebbe"], views: 445, wishlistCount: 33, inquiryCount: 19, whatsappLeads: 14,
    isFeatured: false, isSponsored: false, createdAt: "2024-09-10T06:00:00Z", updatedAt: "2024-09-10T06:00:00Z",
  },
  {
    id: "lst_05", title: "Professional Plumbing Services", slug: "professional-plumbing-kampala",
    description: "Licensed plumber with 10+ years experience. Available 24/7. All plumbing repairs, pipe installations, water tanks.",
    price: 50000, currency: "UGX", priceType: "per_hour", category: "Services",
    images: [makeImage("https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_05")],
    thumbnail: "https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kampala", country: "UG" },
    seller: { ...mockUser, id: "usr_05", firstName: "FixIt", lastName: "Pro" }, store: undefined,
    status: "active",
    attributes: { service_type: "Plumbing", experience_years: 10, availability: "24/7", pricing_model: "Per Hour" },
    tags: ["Plumbing", "Repair", "24/7"], views: 223, wishlistCount: 11, inquiryCount: 34, whatsappLeads: 29,
    isFeatured: false, isSponsored: false, createdAt: "2024-08-01T09:00:00Z", updatedAt: "2024-08-01T09:00:00Z",
  },
  {
    id: "lst_06", title: "Samsung Galaxy S24 Ultra – Sealed", slug: "samsung-galaxy-s24-ultra",
    description: "Brand new Samsung Galaxy S24 Ultra, sealed in box. 256GB, all colors available. With receipt & warranty.",
    price: 3800000, currency: "UGX", priceType: "fixed", category: "Quick Sell",
    images: [makeImage("https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_06")],
    thumbnail: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Nakawa", country: "UG" },
    seller: { ...mockUser, id: "usr_06", firstName: "Mike", lastName: "Gadgets", isVerified: false },
    status: "active", condition: "new",
    attributes: { brand: "Samsung", model: "Galaxy S24 Ultra", storage: "256GB", condition: "Brand New" },
    tags: ["Samsung", "Phone", "Sealed"], views: 1203, wishlistCount: 89, inquiryCount: 67, whatsappLeads: 54,
    isFeatured: true, isSponsored: true, createdAt: "2024-11-05T11:00:00Z", updatedAt: "2024-11-05T11:00:00Z",
  },
  {
    id: "lst_07", title: "iPhone 15 Pro Max 256GB", slug: "iphone-15-pro-max-256gb",
    description: "iPhone 15 Pro Max 256GB Natural Titanium. Fresh sealed box with 1 year Apple warranty. Invoice available.",
    price: 4200000, currency: "UGX", priceType: "fixed", category: "Products",
    images: [makeImage("https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_07")],
    thumbnail: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kampala", country: "UG" },
    seller: mockUser, store: mockStore,
    status: "active", condition: "new",
    attributes: { brand: "Apple", model: "iPhone 15 Pro Max", storage: "256GB", color: "Natural Titanium" },
    tags: ["iPhone", "Apple", "Premium"], views: 987, wishlistCount: 78, inquiryCount: 52, whatsappLeads: 43,
    isFeatured: true, isSponsored: false, createdAt: "2024-11-08T09:00:00Z", updatedAt: "2024-11-08T09:00:00Z",
  },
  {
    id: "lst_08", title: "3 Bedroom Standalone House – Muyenga", slug: "3br-house-muyenga",
    description: "Elegant 3-bedroom standalone house in Muyenga. Maids quarters, garage, garden, borehole. Ready to move in.",
    price: 350000000, currency: "UGX", priceType: "negotiable", category: "Property",
    images: [makeImage("https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_08")],
    thumbnail: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Muyenga", country: "UG" },
    seller: { ...mockUser, id: "usr_07", firstName: "Kampala", lastName: "Realty" }, store: undefined,
    status: "active",
    attributes: { bedrooms: 3, bathrooms: 2, type: "Standalone", listing_type: "For Sale", size_sqm: 200 },
    tags: ["House", "Muyenga", "For Sale"], views: 534, wishlistCount: 41, inquiryCount: 22, whatsappLeads: 18,
    isFeatured: false, isSponsored: false, createdAt: "2024-09-25T12:00:00Z", updatedAt: "2024-09-25T12:00:00Z",
  },
  {
    id: "lst_09", title: "Event Photography & Videography", slug: "event-photography-kampala",
    description: "Professional event photography and videography. Weddings, corporate events, graduations. Full HD + 4K.",
    price: 500000, currency: "UGX", priceType: "fixed", category: "Services",
    images: [makeImage("https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_09")],
    thumbnail: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kampala", country: "UG" },
    seller: { ...mockUser, id: "usr_08", firstName: "SnapPro", lastName: "Studios", rating: 5.0 },
    status: "active",
    attributes: { service_type: "Photography", experience_years: 8, availability: "Weekends", pricing_model: "Fixed" },
    tags: ["Photography", "Events", "Wedding"], views: 389, wishlistCount: 24, inquiryCount: 29, whatsappLeads: 23,
    isFeatured: false, isSponsored: false, createdAt: "2024-10-05T08:00:00Z", updatedAt: "2024-10-05T08:00:00Z",
  },
  {
    id: "lst_10", title: "Yamaha YBR 125 Boda Boda", slug: "yamaha-ybr-125-boda",
    description: "Yamaha YBR 125, 2021 model, good condition, low mileage 12,000km. Documents ready. Negotiate slightly.",
    price: 3500000, currency: "UGX", priceType: "negotiable", category: "Vehicles",
    images: [makeImage("https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_10")],
    thumbnail: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Masaka", country: "UG" },
    seller: { ...mockUser, id: "usr_09", firstName: "MotoMart", lastName: "UG", isVerified: false, rating: 4.3 },
    status: "active", condition: "good",
    attributes: { make: "Yamaha", model: "YBR 125", year: 2021, mileage: 12000, type: "Motorcycle" },
    tags: ["Motorcycle", "Yamaha", "Boda"], views: 567, wishlistCount: 38, inquiryCount: 31, whatsappLeads: 26,
    isFeatured: false, isSponsored: false, createdAt: "2024-10-30T14:00:00Z", updatedAt: "2024-10-30T14:00:00Z",
  },
  {
    id: "lst_11", title: "Riverside Cabin – Jinja (Airbnb)", slug: "riverside-cabin-jinja",
    description: "Cozy riverside cabin near Jinja. Fire pit, kayaking, breakfast included. Perfect for couples & adventurers.",
    price: 200000, currency: "UGX", priceType: "per_night", category: "Stays",
    images: [makeImage("https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_11")],
    thumbnail: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Jinja", country: "UG" },
    seller: { ...mockUser, id: "usr_10", firstName: "Nile", lastName: "Retreats" },
    status: "active",
    attributes: { type: "Cabin", max_guests: 4, amenities: "Kayaking, Fire pit, Breakfast", check_in: "2:00 PM" },
    tags: ["Cabin", "Jinja", "Adventure"], views: 312, wishlistCount: 29, inquiryCount: 17, whatsappLeads: 13,
    isFeatured: false, isSponsored: false, createdAt: "2024-08-20T10:00:00Z", updatedAt: "2024-08-20T10:00:00Z",
  },
  {
    id: "lst_12", title: "DJI Phantom 4 Drone", slug: "dji-phantom-4-drone",
    description: "DJI Phantom 4 barely used, with extra batteries, carry case and remote. Great for aerial photography.",
    price: 1800000, currency: "UGX", priceType: "negotiable", category: "Quick Sell",
    images: [makeImage("https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=700","img_12")],
    thumbnail: "https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=300&w=400",
    location: { city: "Kampala", country: "UG" },
    seller: { ...mockUser, id: "usr_11", firstName: "AeroTech", lastName: "UG", isVerified: false, rating: 4.0 },
    status: "active", condition: "like_new",
    attributes: { brand: "DJI", model: "Phantom 4", condition: "Like New", extras: "3 Batteries, Carry Case" },
    tags: ["Drone", "DJI", "Photography"], views: 678, wishlistCount: 52, inquiryCount: 43, whatsappLeads: 37,
    isFeatured: true, isSponsored: true, createdAt: "2024-11-10T13:00:00Z", updatedAt: "2024-11-10T13:00:00Z",
  },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const mockReviews: Review[] = [
  { id: "rev_01", sellerId: "usr_01", reviewer: { ...mockUser, id: "usr_buyer_01", firstName: "Sarah", lastName: "K." }, rating: 5, comment: "Great seller! Item exactly as described. Fast response on WhatsApp. Will buy again!", isVerifiedPurchase: true, createdAt: "2024-10-15T10:00:00Z" },
  { id: "rev_02", sellerId: "usr_01", reviewer: { ...mockUser, id: "usr_buyer_02", firstName: "Moses", lastName: "O." }, rating: 4, comment: "Good experience. Seller was very responsive. Item delivered in good condition.", isVerifiedPurchase: true, createdAt: "2024-09-28T08:00:00Z" },
  { id: "rev_03", sellerId: "usr_01", reviewer: { ...mockUser, id: "usr_buyer_03", firstName: "Amina", lastName: "N." }, rating: 5, comment: "Very professional. Would definitely buy again from this store!", isVerifiedPurchase: false, createdAt: "2024-09-10T14:00:00Z" },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: "ord_01", orderNumber: "CC-2024-001234",
    listing: mockListings[0],
    buyer: { ...mockUser, id: "usr_buyer_01", firstName: "Sarah", lastName: "K." },
    seller: mockUser,
    quantity: 1, totalAmount: 2500000, currency: "UGX",
    status: "completed", paymentStatus: "completed",
    paymentMethod: "mtn_momo", paymentReference: "MTN-REF-001",
    createdAt: "2024-10-01T09:00:00Z", updatedAt: "2024-10-03T16:00:00Z", completedAt: "2024-10-03T16:00:00Z",
  },
  {
    id: "ord_02", orderNumber: "CC-2024-001235",
    listing: mockListings[6],
    buyer: { ...mockUser, id: "usr_buyer_02", firstName: "Moses", lastName: "O." },
    seller: mockUser,
    quantity: 1, totalAmount: 4200000, currency: "UGX",
    status: "in_progress", paymentStatus: "completed",
    paymentMethod: "stripe", paymentReference: "STR-PI-001",
    createdAt: "2024-11-05T11:00:00Z", updatedAt: "2024-11-05T14:00:00Z",
  },
  {
    id: "ord_03", orderNumber: "CC-2024-001236",
    listing: mockListings[1],
    buyer: { ...mockUser, id: "usr_buyer_03", firstName: "Amina", lastName: "N." },
    seller: { ...mockUser, id: "usr_02", firstName: "Prime", lastName: "Homes" },
    quantity: 1, totalAmount: 800000, currency: "UGX",
    status: "pending", paymentStatus: "pending",
    paymentMethod: "airtel_money",
    createdAt: "2024-11-10T08:00:00Z", updatedAt: "2024-11-10T08:00:00Z",
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: "notif_01", userId: "usr_01", type: "message", title: "New Inquiry", body: "Trendify Store replied to your MacBook inquiry", isRead: false, createdAt: new Date(Date.now() - 120000).toISOString(), icon: "💬" },
  { id: "notif_02", userId: "usr_01", type: "order", title: "Order Confirmed!", body: "Your order #CC-2024-001235 has been confirmed", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), icon: "✅" },
  { id: "notif_03", userId: "usr_01", type: "listing", title: "Price Drop Alert", body: "Toyota Premio dropped to UGX 26,000,000 – in your wishlist!", isRead: true, createdAt: new Date(Date.now() - 10800000).toISOString(), icon: "📉" },
  { id: "notif_04", userId: "usr_01", type: "review", title: "New Review", body: "Sarah K. left you a 5-star review!", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString(), icon: "⭐" },
  { id: "notif_05", userId: "usr_01", type: "system", title: "Subscription Renewed", body: "Your Starter plan was renewed until Dec 31, 2025", isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString(), icon: "🔄" },
];

// ─── WhatsApp Leads ───────────────────────────────────────────────────────────
export const mockWhatsAppLeads: WhatsAppLead[] = [
  { id: "lead_01", listingId: "lst_01", listing: mockListings[0], buyerPhone: "+256701234567", buyerName: "John K.", message: "I'm interested in the MacBook Pro. Is it still available?", status: "converted", createdAt: new Date(Date.now() - 3600000).toISOString(), convertedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "lead_02", listingId: "lst_06", listing: mockListings[5], buyerPhone: "+256702345678", buyerName: "Grace M.", message: "Hello, what colors do you have for the S24 Ultra?", status: "contacted", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "lead_03", listingId: "lst_07", listing: mockListings[6], buyerPhone: "+256703456789", message: "Price for iPhone 15 Pro Max negotiable?", status: "new", createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: "lead_04", listingId: "lst_01", listing: mockListings[0], buyerPhone: "+256704567890", buyerName: "David O.", message: "Does it include warranty?", status: "new", createdAt: new Date(Date.now() - 1800000).toISOString() },
];

// ─── Platform Stats (Admin) ───────────────────────────────────────────────────
export const mockPlatformStats: PlatformStats = {
  totalUsers: 48320,
  totalSellers: 8741,
  totalListings: 124680,
  activeListings: 98340,
  totalOrders: 23410,
  totalRevenue: 4823500000,
  totalWhatsAppLeads: 187340,
  conversionRate: 12.5,
  newUsersToday: 234,
  newListingsToday: 847,
  revenueToday: 14750000,
  ordersToday: 89,
  userGrowth: 18.3,
  listingGrowth: 23.7,
  revenueGrowth: 31.2,
  orderGrowth: 27.8,
};

// ─── Revenue Chart ────────────────────────────────────────────────────────────
export const mockRevenueChart: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    revenue: 80000000 + Math.random() * 120000000,
    orders: 50 + Math.floor(Math.random() * 150),
    subscriptions: 10 + Math.floor(Math.random() * 40),
    featuredListings: 5 + Math.floor(Math.random() * 25),
  };
});

// ─── Category Breakdown ───────────────────────────────────────────────────────
export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: "Products", count: 42300, percentage: 33.9, revenue: 1620000000 },
  { category: "Quick Sell", count: 31200, percentage: 25.0, revenue: 890000000 },
  { category: "Vehicles", count: 19800, percentage: 15.9, revenue: 1240000000 },
  { category: "Services", count: 14700, percentage: 11.8, revenue: 430000000 },
  { category: "Property", count: 9800, percentage: 7.9, revenue: 520000000 },
  { category: "Stays", count: 6880, percentage: 5.5, revenue: 123500000 },
];
