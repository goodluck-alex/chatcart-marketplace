import { useState } from "react";
import {
  CheckCircle2, AlertCircle, Clock, XCircle, ChevronDown, ChevronUp,
  Shield, Smartphone, CreditCard, MessageCircle,
  BarChart3, Search, Bell, Package, Truck,
  Code2, Server, FileText, HeartHandshake, Bot, Layers,
  AlertTriangle, ArrowRight, ExternalLink
} from "lucide-react";

type Priority = "critical" | "high" | "medium" | "low";
type Status   = "done" | "partial" | "missing" | "planned";

interface FeatureItem {
  title: string;
  desc: string;
  status: Status;
  priority: Priority;
  effort: string;
  impact: string;
  notes?: string;
}

interface FeatureGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  items: FeatureItem[];
}

// ─── Feature Audit Data ──────────────────────────────────────────────────────
const groups: FeatureGroup[] = [
  {
    id: "auth",
    label: "Authentication & Security",
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    items: [
      { title: "Phone OTP Login", desc: "Send & verify 6-digit OTP via SMS (Africa's Talking)", status: "partial", priority: "critical", effort: "3 days", impact: "Core – every user needs this", notes: "UI exists, SMS gateway not connected" },
      { title: "Google OAuth Login", desc: "One-tap Google sign-in with ID token verification", status: "partial", priority: "high", effort: "1 day", impact: "High – reduces friction on web", notes: "Button shown, backend endpoint missing" },
      { title: "Apple Login", desc: "Sign in with Apple for iOS users", status: "planned", priority: "medium", effort: "2 days", impact: "Required for iOS App Store listing" },
      { title: "JWT + Refresh Tokens", desc: "Auto-refresh tokens, 15-min access + 30-day refresh", status: "partial", priority: "critical", effort: "2 days", impact: "Security backbone", notes: "Interceptor built in api.ts, mock tokens used" },
      { title: "Device Tracking", desc: "Track login sessions per device, remote logout", status: "missing", priority: "high", effort: "2 days", impact: "Security & fraud prevention" },
      { title: "Multi-device Support", desc: "Login history page, revoke sessions", status: "planned", priority: "medium", effort: "1 day", impact: "Trust signal for users" },
      { title: "Account Lockout", desc: "Block after N failed login attempts, CAPTCHA", status: "missing", priority: "high", effort: "1 day", impact: "Prevents brute force attacks" },
      { title: "2FA for Admin", desc: "TOTP / Email 2FA required for admin console login", status: "missing", priority: "critical", effort: "2 days", impact: "Protects entire platform data", notes: "Settings toggle exists, logic not wired" },
      { title: "Email Verification", desc: "Verify email before seller can post listings", status: "missing", priority: "medium", effort: "1 day", impact: "Reduces fake accounts" },
      { title: "Rate Limiting (Frontend)", desc: "Debounce search, throttle API calls, show errors gracefully", status: "partial", priority: "high", effort: "1 day", impact: "UX + abuse prevention" },
    ],
  },
  {
    id: "listings",
    label: "Listing Engine",
    icon: Package,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    items: [
      { title: "Create Listing (Full Flow)", desc: "Multi-step form: type → plan → details → images → publish", status: "partial", priority: "critical", effort: "3 days", impact: "Core revenue driver", notes: "UI done, FormData not submitted to real API" },
      { title: "Image Upload (Cloudflare R2)", desc: "Upload up to 10 images, drag-reorder, crop, compress", status: "missing", priority: "critical", effort: "2 days", impact: "Listings without images get 70% fewer views", notes: "UI placeholders exist, no upload logic" },
      { title: "Edit / Update Listing", desc: "Full edit flow with image management", status: "missing", priority: "high", effort: "2 days", impact: "Sellers need to update prices & availability" },
      { title: "Listing Status Management", desc: "Mark as sold, rented, available, pause", status: "missing", priority: "high", effort: "1 day", impact: "Keeps marketplace accurate" },
      { title: "Dynamic Category Fields", desc: "Show Bedrooms for Property, Make/Model for Vehicles etc.", status: "partial", priority: "high", effort: "2 days", impact: "Data quality for search/filter", notes: "Fields defined, not saved to attributes" },
      { title: "Listing Expiry & Renewal", desc: "Auto-expire after 30 days, notify seller to renew", status: "missing", priority: "medium", effort: "2 days", impact: "Keeps active listings fresh" },
      { title: "Boost / Feature a Listing", desc: "Pay to feature listing for 7/14/30 days", status: "partial", priority: "high", effort: "2 days", impact: "Primary upsell revenue", notes: "Admin can feature; seller self-serve missing" },
      { title: "Listing Duplication", desc: "Clone an existing listing to save time", status: "missing", priority: "low", effort: "0.5 days", impact: "UX for power sellers" },
      { title: "Draft / Scheduled Listing", desc: "Save draft, publish at a future date/time", status: "missing", priority: "medium", effort: "2 days", impact: "Business sellers need scheduling" },
      { title: "Listing Share (Deep Link)", desc: "Share listing via WhatsApp, copy link, social", status: "partial", priority: "high", effort: "1 day", impact: "Organic viral growth", notes: "Share button exists, no real URL" },
      { title: "View Counter (Real)", desc: "Increment view on every unique listing open", status: "partial", priority: "medium", effort: "0.5 days", impact: "Analytics accuracy", notes: "trackView API exists, not called on mount" },
      { title: "360° / Video Support", desc: "Upload short video or 360 images for vehicles/stays", status: "planned", priority: "low", effort: "3 days", impact: "Premium feature for vehicles & stays" },
    ],
  },
  {
    id: "search",
    label: "Search & Discovery",
    icon: Search,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
    items: [
      { title: "Full-text Search (Meilisearch)", desc: "Instant search across title, description, tags, location", status: "partial", priority: "critical", effort: "2 days", impact: "Discovery is how 80% of sales happen", notes: "Proxy endpoint in api.ts, Meilisearch not wired" },
      { title: "Search Suggestions / Autocomplete", desc: "Dropdown suggestions as user types", status: "missing", priority: "high", effort: "1 day", impact: "Reduces zero-result searches by 40%" },
      { title: "Search Filters", desc: "Price range, location, category, condition, verified", status: "partial", priority: "high", effort: "1 day", impact: "Users convert 3× more with filters", notes: "UI done, not connected to real API" },
      { title: "Map-based Search", desc: "View listings on a map, filter by radius", status: "missing", priority: "medium", effort: "3 days", impact: "Critical for property & services" },
      { title: "Nearby Listings (GPS)", desc: "Show listings near user's current location", status: "missing", priority: "high", effort: "2 days", impact: "Local commerce — core to ChatCart" },
      { title: "Search History", desc: "Save recent searches, one-tap repeat", status: "missing", priority: "low", effort: "0.5 days", impact: "UX retention improvement" },
      { title: "Saved Searches / Alerts", desc: "Notify user when new listing matches their saved search", status: "missing", priority: "medium", effort: "2 days", impact: "Drives repeat app opens" },
      { title: "Trending Searches", desc: "Show popular keywords on search screen", status: "missing", priority: "low", effort: "1 day", impact: "Discovery for new users" },
    ],
  },
  {
    id: "payments",
    label: "Payments & Subscriptions",
    icon: CreditCard,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    items: [
      { title: "MTN Mobile Money Integration", desc: "Real MTN MoMo API: initiate payment, webhook callback", status: "missing", priority: "critical", effort: "3 days", impact: "70% of Uganda users pay via MoMo", notes: "Config in settings, no real API calls" },
      { title: "Airtel Money Integration", desc: "Real Airtel Money API for payments", status: "missing", priority: "critical", effort: "2 days", impact: "20% of market uses Airtel" },
      { title: "Stripe Integration", desc: "Card payments for diaspora & international users", status: "missing", priority: "high", effort: "2 days", impact: "International buyers" },
      { title: "Subscription Billing", desc: "Recurring monthly billing with auto-renew", status: "missing", priority: "critical", effort: "3 days", impact: "Core SaaS revenue", notes: "Plans shown in UI, no payment flow" },
      { title: "Payment Receipt / Invoice", desc: "Email/WhatsApp receipt after payment", status: "missing", priority: "high", effort: "1 day", impact: "Trust + tax compliance" },
      { title: "Subscription Upgrade/Downgrade", desc: "Prorated billing when changing plans", status: "missing", priority: "medium", effort: "2 days", impact: "Revenue optimization" },
      { title: "Escrow Payments (Future)", desc: "Hold funds until buyer confirms delivery", status: "planned", priority: "medium", effort: "5 days", impact: "Game changer for trust & GMV" },
      { title: "Refund & Dispute Flow", desc: "Buyer requests refund, admin resolves", status: "partial", priority: "high", effort: "2 days", impact: "Required for consumer protection", notes: "UI shows dispute, no payment reversal" },
      { title: "Payment Analytics (Admin)", desc: "Revenue breakdown by method, country, plan", status: "partial", priority: "high", effort: "1 day", impact: "Business intelligence", notes: "Chart exists, payment data not real" },
      { title: "Free Trial Logic", desc: "7-day trial for Starter/Pro, auto-charge after", status: "missing", priority: "high", effort: "1 day", impact: "Reduces signup friction" },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp Integration",
    icon: MessageCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    items: [
      { title: "WhatsApp Deep Link (Buy Button)", desc: "Pre-filled message with listing details on tap", status: "done", priority: "critical", effort: "Done", impact: "Core conversion mechanism", notes: "✅ Fully implemented" },
      { title: "WhatsApp Lead Tracking", desc: "Track every click → log as lead in dashboard", status: "partial", priority: "critical", effort: "1 day", impact: "ROI for sellers", notes: "API endpoint exists, not called on every click" },
      { title: "WhatsApp Business API (Cloud)", desc: "Send automated messages: order confirm, receipt, OTP", status: "missing", priority: "high", effort: "4 days", impact: "Automation at scale" },
      { title: "WhatsApp Webhook (Incoming)", desc: "Receive & process replies via WhatsApp webhook", status: "missing", priority: "high", effort: "3 days", impact: "In-app chat sync from WhatsApp" },
      { title: "In-App Chat (Fallback)", desc: "Native messaging when WhatsApp not available", status: "partial", priority: "medium", effort: "3 days", impact: "Keeps users in-app", notes: "Chat UI exists, no real-time backend" },
      { title: "Real-time Chat (WebSocket)", desc: "Socket.io or WebSocket for live in-app messages", status: "missing", priority: "high", effort: "4 days", impact: "Real marketplace feel" },
      { title: "Message Templates", desc: "Pre-approved WhatsApp templates for order updates", status: "missing", priority: "medium", effort: "2 days", impact: "Compliance + automation" },
      { title: "Broadcast Notifications (WA)", desc: "Send promotions to opted-in users via WhatsApp", status: "missing", priority: "medium", effort: "2 days", impact: "Re-engagement marketing" },
    ],
  },
  {
    id: "notifications",
    label: "Push Notifications",
    icon: Bell,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    items: [
      { title: "FCM Web Push Setup", desc: "Register service worker, request permission, store token", status: "missing", priority: "critical", effort: "2 days", impact: "Re-engagement — 3× more opens", notes: "VAPID config in config.ts, no service worker" },
      { title: "In-App Notifications Bell", desc: "Dropdown with unread count, mark read", status: "done", priority: "high", effort: "Done", impact: "User engagement", notes: "✅ Fully built" },
      { title: "Order Status Notifications", desc: "Push when order confirmed, shipped, delivered", status: "missing", priority: "critical", effort: "1 day", impact: "Core transactional notification" },
      { title: "New Message Notification", desc: "Push when someone sends a WhatsApp inquiry", status: "missing", priority: "high", effort: "1 day", impact: "Seller response rate" },
      { title: "Price Drop Alert", desc: "Notify when wishlist item price drops", status: "missing", priority: "high", effort: "1 day", impact: "Re-engagement & conversion" },
      { title: "New Listing Alert", desc: "Notify followers when store posts new listing", status: "missing", priority: "medium", effort: "1 day", impact: "Follower engagement" },
      { title: "SMS Notifications (Africa's Talking)", desc: "SMS fallback for critical events (order, OTP)", status: "missing", priority: "high", effort: "2 days", impact: "Reach users without smartphone app" },
      { title: "Email Notifications (SendGrid)", desc: "Welcome, receipt, weekly digest emails", status: "missing", priority: "medium", effort: "2 days", impact: "Professional credibility" },
      { title: "Admin Broadcast Notification", desc: "Push to all/segment users from admin panel", status: "partial", priority: "medium", effort: "1 day", impact: "Marketing campaigns", notes: "UI form exists, backend not connected" },
    ],
  },
  {
    id: "trust",
    label: "Trust, Safety & Reviews",
    icon: HeartHandshake,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    items: [
      { title: "Seller Verification (ID)", desc: "Upload National ID or business cert, admin reviews", status: "missing", priority: "critical", effort: "3 days", impact: "#1 trust signal on marketplace" },
      { title: "Review & Rating System", desc: "Leave reviews after order, reply to reviews", status: "partial", priority: "high", effort: "2 days", impact: "Social proof drives 60% of purchases", notes: "UI shows mock reviews, no real write flow" },
      { title: "Fraud Reporting", desc: "Report listing/user button with reason categories", status: "partial", priority: "high", effort: "1 day", impact: "Community moderation", notes: "Report button UI exists, no submission" },
      { title: "Listing Moderation Queue", desc: "Auto-flag suspicious listings, admin review queue", status: "partial", priority: "high", effort: "2 days", impact: "Platform health", notes: "Admin listings page shows pending_review" },
      { title: "Dispute Resolution Center", desc: "Structured dispute flow: buyer files → admin mediates → resolves", status: "partial", priority: "high", effort: "3 days", impact: "Required for escrow & high-value items", notes: "Admin can resolve, no buyer-facing flow" },
      { title: "Seller Badge System", desc: "Top Seller, Trusted, Verified, Fast Responder badges", status: "missing", priority: "medium", effort: "2 days", impact: "Gamification → seller motivation" },
      { title: "Block / Mute Users", desc: "Block abusive buyers or sellers", status: "missing", priority: "medium", effort: "1 day", impact: "User safety" },
      { title: "Anti-spam / Auto-moderation", desc: "Detect duplicate listings, keyword blacklist, image check", status: "missing", priority: "high", effort: "3 days", impact: "Marketplace quality" },
    ],
  },
  {
    id: "store",
    label: "Stores & Business Profiles",
    icon: Layers,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    items: [
      { title: "Public Store Profile Page", desc: "Dedicated page /stores/{slug} with all listings", status: "missing", priority: "high", effort: "2 days", impact: "Business branding" },
      { title: "Store Creation Flow", desc: "Guided setup: name, logo, description, categories", status: "partial", priority: "high", effort: "2 days", impact: "Needed before posting listings", notes: "Step 4 in sell flow has basic form" },
      { title: "Follow a Store", desc: "Users can follow stores, get notified of new listings", status: "missing", priority: "medium", effort: "1 day", impact: "Retention & repeat buyers" },
      { title: "Store Analytics", desc: "Views, followers, leads, orders chart per store", status: "partial", priority: "high", effort: "1 day", impact: "Value for business sellers", notes: "Seller dashboard has overview, not store-level" },
      { title: "Store Promotions", desc: "Seller can run sale, bundle deals, promo codes", status: "missing", priority: "medium", effort: "3 days", impact: "Revenue for sellers & platform" },
      { title: "Store WhatsApp Catalog Sync", desc: "Sync listings to WhatsApp Business catalog", status: "planned", priority: "low", effort: "5 days", impact: "Power feature for business sellers" },
      { title: "Multi-location Stores", desc: "Business with branches in multiple cities", status: "planned", priority: "low", effort: "3 days", impact: "Enterprise tier feature" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reporting",
    icon: BarChart3,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    items: [
      { title: "Admin Revenue Dashboard", desc: "Real revenue by day/week/month, by category & country", status: "partial", priority: "critical", effort: "2 days", impact: "Business decision making", notes: "Charts built with mock data" },
      { title: "Seller Performance Dashboard", desc: "Views, leads, conversion rate, best listings", status: "partial", priority: "high", effort: "1 day", impact: "Seller retention", notes: "Basic charts in SellerDashboardPage" },
      { title: "Funnel Analytics", desc: "View → WhatsApp → Order → Complete conversion funnel", status: "missing", priority: "high", effort: "2 days", impact: "Where are users dropping off?" },
      { title: "Country / City Heatmaps", desc: "Where are listings and buyers concentrated?", status: "missing", priority: "medium", effort: "2 days", impact: "Expansion strategy" },
      { title: "Cohort / Retention Analysis", desc: "Day-7, Day-30 user retention tracking", status: "missing", priority: "medium", effort: "3 days", impact: "Product health metric" },
      { title: "Export Reports (CSV/PDF)", desc: "Export orders, revenue, users to CSV or PDF", status: "missing", priority: "medium", effort: "2 days", impact: "Finance & compliance" },
      { title: "Real-time Active Listings Counter", desc: "Live count of active listings on homepage", status: "missing", priority: "low", effort: "0.5 days", impact: "Social proof" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery & Logistics",
    icon: Truck,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    items: [
      { title: "Delivery Address Management", desc: "Save multiple addresses, select on checkout", status: "missing", priority: "high", effort: "2 days", impact: "Smoother order completion" },
      { title: "Delivery Partner Integration", desc: "SafeBoda, Glovo, SendyIt API for last-mile delivery", status: "planned", priority: "medium", effort: "5 days", impact: "Killer differentiator vs Jiji" },
      { title: "Delivery Tracking", desc: "Real-time order tracking after dispatch", status: "planned", priority: "medium", effort: "4 days", impact: "Trust & post-purchase experience" },
      { title: "Seller Delivery Options", desc: "Seller sets: self-delivery, pickup only, platform delivery", status: "missing", priority: "high", effort: "1 day", impact: "Sets buyer expectations" },
      { title: "Delivery Fee Calculator", desc: "Auto-calculate fee based on distance", status: "planned", priority: "medium", effort: "2 days", impact: "Transparent pricing" },
    ],
  },
  {
    id: "ai",
    label: "AI & Automation",
    icon: Bot,
    color: "text-cyan-600",
    bg: "bg-cyan-50 border-cyan-200",
    items: [
      { title: "AI Listing Description Generator", desc: "Type title → AI generates full description", status: "missing", priority: "medium", effort: "1 day", impact: "Reduces listing creation friction by 60%" },
      { title: "AI Price Recommendation", desc: "Suggest optimal price based on similar listings", status: "planned", priority: "medium", effort: "3 days", impact: "Faster sales for sellers" },
      { title: "AI Image Auto-tagging", desc: "Auto-detect category from uploaded photo", status: "planned", priority: "low", effort: "3 days", impact: "Reduces listing errors" },
      { title: "WhatsApp Chatbot (Auto-reply)", desc: "AI replies to common buyer questions 24/7", status: "planned", priority: "high", effort: "5 days", impact: "Sellers sleep, bot converts" },
      { title: "Personalized Feed (Recommendations)", desc: "ML-based listing recommendations per user", status: "planned", priority: "medium", effort: "7 days", impact: "Engagement & time-in-app" },
      { title: "Fraud Detection AI", desc: "Detect fake listings, scam accounts automatically", status: "planned", priority: "high", effort: "5 days", impact: "Platform trust & safety" },
    ],
  },
  {
    id: "infra",
    label: "Infrastructure & DevOps",
    icon: Server,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    items: [
      { title: "NestJS Backend (PostgreSQL)", desc: "All REST API endpoints for frontend", status: "missing", priority: "critical", effort: "2–4 weeks", impact: "Nothing real works without this" },
      { title: "Redis Cache Layer", desc: "Cache listings, sessions, rate limits", status: "missing", priority: "high", effort: "3 days", impact: "10× API performance" },
      { title: "Meilisearch Setup", desc: "Index listings, search synonyms, typo tolerance", status: "missing", priority: "high", effort: "2 days", impact: "Fast, accurate search" },
      { title: "Cloudflare R2 + CDN", desc: "Store & serve listing images globally", status: "missing", priority: "critical", effort: "1 day", impact: "Image performance for users" },
      { title: "CI/CD Pipeline", desc: "GitHub Actions → build → test → deploy", status: "missing", priority: "high", effort: "2 days", impact: "Safe, fast deployments" },
      { title: "Environment Configuration", desc: ".env.example, secrets management, staging vs prod", status: "partial", priority: "critical", effort: "0.5 days", impact: "Security & team onboarding", notes: "config.ts has all vars listed" },
      { title: "Error Monitoring (Sentry)", desc: "Capture frontend & backend errors in production", status: "missing", priority: "high", effort: "1 day", impact: "Know about bugs before users report" },
      { title: "Database Migrations", desc: "TypeORM/Prisma migrations for schema versioning", status: "missing", priority: "critical", effort: "3 days", impact: "Safe schema changes without data loss" },
      { title: "API Documentation (Swagger)", desc: "Auto-generated API docs from NestJS decorators", status: "missing", priority: "medium", effort: "1 day", impact: "Dev onboarding & mobile team" },
      { title: "Health Check Endpoints", desc: "GET /health returns DB, Redis, search status", status: "partial", priority: "high", effort: "0.5 days", impact: "Monitoring & uptime alerts", notes: "Admin shows status UI, no real check" },
    ],
  },
  {
    id: "legal",
    label: "Legal & Compliance",
    icon: FileText,
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    items: [
      { title: "Terms of Service Page", desc: "Full legal ToS users must accept", status: "missing", priority: "critical", effort: "1 day", impact: "Legal protection for the platform" },
      { title: "Privacy Policy Page", desc: "GDPR/data protection compliant privacy policy", status: "missing", priority: "critical", effort: "1 day", impact: "Required by law in UG/KE" },
      { title: "Cookie Consent Banner", desc: "Accept/reject cookies per GDPR", status: "missing", priority: "medium", effort: "0.5 days", impact: "EU users & compliance" },
      { title: "Seller Agreement", desc: "Legal agreement sellers accept when listing", status: "missing", priority: "high", effort: "1 day", impact: "Prevents misuse liability" },
      { title: "KYC Compliance", desc: "Know Your Customer checks for high-value sellers", status: "missing", priority: "medium", effort: "3 days", impact: "Required for payment gateways" },
      { title: "GDPR / Data Export", desc: "Let users download or delete their data", status: "missing", priority: "medium", effort: "2 days", impact: "Legal right in many jurisdictions" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile App (Flutter)",
    icon: Smartphone,
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-200",
    items: [
      { title: "Flutter App Setup", desc: "Project structure, flavors (dev/staging/prod)", status: "missing", priority: "critical", effort: "1 week", impact: "80% of users will use mobile" },
      { title: "FCM Push Notifications", desc: "Background & foreground notifications on Android/iOS", status: "missing", priority: "critical", effort: "2 days", impact: "Notification delivery requires native app" },
      { title: "Camera & Gallery Upload", desc: "Take photo or pick from gallery for listings", status: "missing", priority: "critical", effort: "2 days", impact: "Sellers need mobile camera" },
      { title: "Deep Linking", desc: "chatcart://listing/123 opens listing in app", status: "missing", priority: "high", effort: "1 day", impact: "WhatsApp share links open in-app" },
      { title: "Offline Mode", desc: "View cached listings when no internet", status: "planned", priority: "medium", effort: "3 days", impact: "Rural users with poor connectivity" },
      { title: "GPS Location Services", desc: "Auto-detect city for nearby listings", status: "missing", priority: "high", effort: "1 day", impact: "Hyperlocal commerce" },
      { title: "App Store / Play Store Publish", desc: "App signing, store listings, screenshots, review", status: "missing", priority: "critical", effort: "1 week", impact: "Distribution" },
    ],
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusConfig = {
  done:    { label: "Done",    color: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500", icon: CheckCircle2 },
  partial: { label: "Partial", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", icon: AlertCircle },
  missing: { label: "Missing", color: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-500",   icon: XCircle },
  planned: { label: "Planned", color: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-400",  icon: Clock },
};
const priorityConfig = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
  high:     { label: "High",     color: "bg-orange-100 text-orange-700" },
  medium:   { label: "Medium",   color: "bg-yellow-100 text-yellow-700" },
  low:      { label: "Low",      color: "bg-gray-100 text-gray-600" },
};

interface Props { onNavigate: (page: string) => void; }

export default function RoadmapPage({ onNavigate }: Props) {
  const [expanded, setExpanded] = useState<string[]>(["auth", "listings", "payments", "whatsapp"]);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  const toggle = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Compute totals
  const allItems = groups.flatMap(g => g.items);
  const total     = allItems.length;
  const done      = allItems.filter(i => i.status === "done").length;
  const partial   = allItems.filter(i => i.status === "partial").length;
  const missing   = allItems.filter(i => i.status === "missing").length;
  const planned   = allItems.filter(i => i.status === "planned").length;
  const critical  = allItems.filter(i => i.priority === "critical" && i.status !== "done").length;
  const pct = Math.round(((done + partial * 0.5) / total) * 100);

  const filterItems = (items: FeatureItem[]) =>
    items.filter(item => {
      const matchStatus   = filterStatus   === "all" || item.status   === filterStatus;
      const matchPriority = filterPriority === "all" || item.priority === filterPriority;
      return matchStatus && matchPriority;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 md:pb-12">

      {/* ── Page Header ── */}
      <div className="py-8 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 text-orange-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
          <AlertTriangle className="w-4 h-4" />
          Full Feature Audit & Roadmap
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          ChatCart — What We Have, What's Missing
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-base">
          A complete honest audit of every feature ChatCart needs to be a production-ready marketplace.
          Review, prioritize, and build what matters most.
        </p>
      </div>

      {/* ── Progress Overview ── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut */}
          <div className="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{pct}%</span>
              <span className="text-xs text-gray-400">Complete</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Total Features", value: total, color: "text-white" },
              { label: "✅ Done", value: done, color: "text-green-400" },
              { label: "⚠️ Partial", value: partial, color: "text-yellow-400" },
              { label: "❌ Missing", value: missing, color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-3">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div className="bg-red-900/40 border border-red-700/50 rounded-2xl p-4 text-center md:w-40 shrink-0">
            <div className="text-3xl font-black text-red-400">{critical}</div>
            <div className="text-xs text-red-300 font-bold">🔥 Critical items</div>
            <div className="text-xs text-gray-500 mt-1">must fix before launch</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Build progress</span>
            <span>{pct}% of {total} features</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
            <div className="bg-yellow-500 h-full transition-all" style={{ width: `${(partial / total) * 100}%` }} />
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${(planned / total) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" />Done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full inline-block" />Partial</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />Planned</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-600 rounded-full inline-block" />Missing</span>
          </div>
        </div>
      </div>

      {/* ── TOP CRITICAL ITEMS ── */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="font-black text-red-800 text-lg">🔥 Build These First — Critical Missing Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allItems
            .filter(i => i.priority === "critical" && (i.status === "missing" || i.status === "partial"))
            .slice(0, 10)
            .map((item, idx) => (
              <div key={idx} className="bg-white border border-red-100 rounded-xl p-3 flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  {item.notes && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{item.notes}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[item.status].color}`}>
                      {statusConfig[item.status].label}
                    </span>
                    <span className="text-[10px] text-gray-400">⏱ {item.effort}</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <span className="px-2 py-1 text-xs text-gray-400 font-medium self-center">Status:</span>
          {(["all", "done", "partial", "missing", "planned"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === s ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <span className="px-2 py-1 text-xs text-gray-400 font-medium self-center">Priority:</span>
          {(["all", "critical", "high", "medium", "low"] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterPriority === p ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setExpanded(groups.map(g => g.id)); }}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpanded([])}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
        >
          Collapse All
        </button>
      </div>

      {/* ── Feature Groups ── */}
      <div className="space-y-4">
        {groups.map(group => {
          const items = filterItems(group.items);
          const isOpen = expanded.includes(group.id);
          const groupDone    = group.items.filter(i => i.status === "done").length;
          const groupPartial = group.items.filter(i => i.status === "partial").length;
          const groupTotal   = group.items.length;
          const groupPct = Math.round(((groupDone + groupPartial * 0.5) / groupTotal) * 100);
          const hasCritical  = group.items.some(i => i.priority === "critical" && i.status !== "done");

          if (items.length === 0 && (filterStatus !== "all" || filterPriority !== "all")) return null;

          return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Group Header */}
              <button
                onClick={() => toggle(group.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${group.bg} border flex items-center justify-center shrink-0`}>
                  <group.icon className={`w-5 h-5 ${group.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-gray-900 text-base">{group.label}</h3>
                    {hasCritical && (
                      <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                        🔥 Critical items
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 max-w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all" style={{ width: `${groupPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{groupPct}% · {groupTotal} features</span>
                    <div className="flex gap-1">
                      {["done", "partial", "missing", "planned"].map(s => {
                        const count = group.items.filter(i => i.status === s).length;
                        if (!count) return null;
                        return (
                          <span key={s} className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            s === "done" ? "bg-green-100 text-green-700" :
                            s === "partial" ? "bg-yellow-100 text-yellow-700" :
                            s === "missing" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                }
              </button>

              {/* Feature Items */}
              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {items.map((item, idx) => {
                    const sc = statusConfig[item.status];
                    const pc = priorityConfig[item.priority];
                    const StatusIcon = sc.icon;
                    return (
                      <div key={idx} className={`flex items-start gap-4 px-4 py-3.5 hover:bg-gray-50/80 transition-colors ${item.status === "missing" && item.priority === "critical" ? "bg-red-50/30" : ""}`}>
                        <StatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${
                          item.status === "done" ? "text-green-500" :
                          item.status === "partial" ? "text-yellow-500" :
                          item.status === "missing" ? "text-red-400" :
                          "text-blue-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          {item.notes && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3 text-orange-500 shrink-0" />
                              <p className="text-xs text-orange-600 italic">{item.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${pc.color}`}>
                            {pc.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${sc.color}`}>
                            {sc.label}
                          </span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">⏱ {item.effort}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Recommended Build Order ── */}
      <div className="mt-10 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6">
        <h2 className="text-xl font-black text-gray-900 mb-1">📋 Recommended Build Order (Phases)</h2>
        <p className="text-gray-500 text-sm mb-5">Follow this order to launch fastest with least risk</p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              phase: 1, title: "MVP Launch (Week 1–4)", color: "from-red-500 to-orange-500", bg: "bg-red-50 border-red-200",
              items: [
                "NestJS backend + PostgreSQL schema",
                "Phone OTP auth (Africa's Talking SMS)",
                "Real listing CRUD with R2 image upload",
                "MTN MoMo + Airtel Money payments",
                "Subscription billing (Starter/Pro plans)",
                "Meilisearch integration for search",
                "FCM push notifications (web + mobile)",
                "Terms of Service + Privacy Policy pages",
              ]
            },
            {
              phase: 2, title: "Growth (Week 5–8)", color: "from-orange-500 to-yellow-500", bg: "bg-orange-50 border-orange-200",
              items: [
                "WhatsApp Business API (auto-replies)",
                "Real-time WebSocket chat",
                "Seller ID verification flow",
                "Map-based listing search",
                "Delivery address management",
                "Review & rating write flow",
                "Deep links for listing sharing",
                "Flutter app (Android first)",
              ]
            },
            {
              phase: 3, title: "Retention (Week 9–12)", color: "from-green-500 to-teal-500", bg: "bg-green-50 border-green-200",
              items: [
                "AI listing description generator",
                "Price drop alerts (wishlist)",
                "Saved searches + email alerts",
                "Seller badge system",
                "Delivery partner integration",
                "Advanced admin analytics + CSV export",
                "Promo codes & seller promotions",
                "Fraud detection & auto-moderation",
              ]
            },
            {
              phase: 4, title: "Scale (Month 4+)", color: "from-purple-500 to-indigo-600", bg: "bg-purple-50 border-purple-200",
              items: [
                "Escrow payment system",
                "AI price recommendations",
                "WhatsApp chatbot automation",
                "ML personalized feed",
                "Multi-country rollout (KE, TZ)",
                "Enterprise store plans",
                "WhatsApp catalog sync",
                "iOS App Store publish",
              ]
            },
          ].map(phase => (
            <div key={phase.phase} className={`rounded-2xl border p-4 ${phase.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phase.color} text-white font-black text-lg flex items-center justify-center shadow-md`}>
                  {phase.phase}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">{phase.title}</h3>
                  <p className="text-xs text-gray-500">{phase.items.length} key deliverables</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Backend Spec Summary ── */}
      <div className="mt-8 bg-gray-900 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Code2 className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-black">Backend Architecture Summary</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          {[
            { label: "Framework", value: "NestJS (TypeScript)", icon: "⚙️" },
            { label: "Database", value: "PostgreSQL + TypeORM", icon: "🗄️" },
            { label: "Cache", value: "Redis (ioredis)", icon: "⚡" },
            { label: "Search", value: "Meilisearch", icon: "🔍" },
            { label: "Storage", value: "Cloudflare R2 (S3 SDK)", icon: "☁️" },
            { label: "Auth", value: "JWT + Passport + OTP", icon: "🔐" },
            { label: "Payments", value: "MTN MoMo + Airtel + Stripe", icon: "💳" },
            { label: "Push", value: "Firebase Cloud Messaging", icon: "🔔" },
            { label: "Email", value: "SendGrid", icon: "📧" },
            { label: "SMS", value: "Africa's Talking", icon: "📱" },
            { label: "WhatsApp", value: "WA Business Cloud API", icon: "💬" },
            { label: "Realtime", value: "Socket.io (WebSocket)", icon: "🔄" },
          ].map(tech => (
            <div key={tech.label} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl shrink-0">{tech.icon}</span>
              <div>
                <p className="text-xs text-gray-400">{tech.label}</p>
                <p className="text-sm font-bold text-white">{tech.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-300 mb-2">📁 Recommended NestJS Module Structure</p>
          <pre className="text-xs text-gray-400 font-mono leading-relaxed overflow-x-auto">{`src/
├── auth/          # OTP, JWT, Google, Apple, guards
├── users/         # Profile, wishlist, notifications
├── listings/      # CRUD, search, featured, images
├── stores/        # Business profiles, analytics
├── orders/        # Order lifecycle, status updates  
├── payments/      # MTN, Airtel, Stripe, webhooks
├── reviews/       # Ratings, replies, reports
├── whatsapp/      # Leads, templates, webhook
├── search/        # Meilisearch proxy, indexing
├── notifications/ # FCM, SendGrid, Africa's Talking
├── admin/         # Stats, moderation, user mgmt
├── upload/        # Cloudflare R2 file handling
└── common/        # Guards, pipes, interceptors`}</pre>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-4">Start building the backend and connect it to this frontend using the API client in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">src/lib/api.ts</code></p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate("home")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
          >
            Back to App <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate("admin")}
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            View Admin Console <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
