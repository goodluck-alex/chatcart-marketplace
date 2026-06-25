// ─── ChatCart Environment Configuration ───────────────────────────────────────
// All API base URLs and secrets should be set via environment variables.
// Create a `.env` file at project root (never commit secrets).
//
// Required env vars:
//   VITE_API_BASE_URL      → NestJS backend base URL  (e.g. https://api.chatcart.africa)
//   VITE_WS_URL            → WebSocket server URL     (e.g. wss://api.chatcart.africa)
//   VITE_WHATSAPP_PHONE    → WhatsApp business number (digits only)
//   VITE_GOOGLE_CLIENT_ID  → Google OAuth client ID
//   VITE_FCM_VAPID_KEY     → Firebase VAPID key for push notifications
//   VITE_MEILISEARCH_URL   → Meilisearch instance URL
//   VITE_MEILISEARCH_KEY   → Meilisearch public search key
//   VITE_CLOUDFLARE_R2_URL → Cloudflare R2 public CDN URL

export const config = {
  apiBaseUrl:        import.meta.env.VITE_API_BASE_URL      ?? "https://api.chatcart.africa/v1",
  wsUrl:             import.meta.env.VITE_WS_URL            ?? "wss://api.chatcart.africa",
  whatsappPhone:     import.meta.env.VITE_WHATSAPP_PHONE    ?? "256700000000",
  googleClientId:    import.meta.env.VITE_GOOGLE_CLIENT_ID  ?? "",
  fcmVapidKey:       import.meta.env.VITE_FCM_VAPID_KEY     ?? "",
  meilisearchUrl:    import.meta.env.VITE_MEILISEARCH_URL   ?? "https://search.chatcart.africa",
  meilisearchKey:    import.meta.env.VITE_MEILISEARCH_KEY   ?? "",
  r2CdnUrl:          import.meta.env.VITE_CLOUDFLARE_R2_URL ?? "https://cdn.chatcart.africa",

  // App constants
  appName:           "ChatCart",
  appTagline:        "Buy. Sell. Rent. Book. Hire.",
  supportedCountries:["UG", "KE", "TZ"],
  defaultCurrency:   "UGX",
  defaultLocale:     "en-UG",
  version:           "1.0.0",
} as const;

export type SupportedCountry = typeof config.supportedCountries[number];
