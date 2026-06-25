import { useState } from "react";
import {
  BookOpen, Terminal, Server, Globe, Shield, Database,
  GitBranch, FileText, Zap,
  Copy, Check, ExternalLink, AlertTriangle, CheckCircle2, Package,
  BarChart3, ArrowRight, Code2, Layers
} from "lucide-react";

interface Props { onNavigate: (page: string) => void; }

type DocSection = "overview" | "installation" | "env" | "services" | "backend" | "database" | "deployment" | "contributing";

const sections: { id: DocSection; label: string; icon: React.ElementType; color: string }[] = [
  { id: "overview",     label: "Overview",           icon: BookOpen,       color: "text-purple-600" },
  { id: "installation", label: "Installation",        icon: Terminal,       color: "text-blue-600" },
  { id: "env",          label: "Environment Vars",    icon: Shield,         color: "text-orange-600" },
  { id: "services",     label: "Third-Party Services",icon: Globe,          color: "text-green-600" },
  { id: "backend",      label: "Backend Guide",       icon: Server,         color: "text-indigo-600" },
  { id: "database",     label: "Database Schema",     icon: Database,       color: "text-teal-600" },
  { id: "deployment",   label: "Deployment",          icon: Zap,            color: "text-rose-600" },
  { id: "contributing", label: "Contributing",        icon: GitBranch,      color: "text-amber-600" },
];

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-gray-800 rounded-t-xl px-4 py-2">
        <span className="text-xs text-gray-400 font-mono">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="w-3 h-3" />Copy</>}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 text-xs font-mono p-4 rounded-b-xl overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>{label}</span>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-black text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 text-sm leading-relaxed mb-3">{children}</p>;
}

// ── Section Content Components ─────────────────────────────────────────────
function OverviewSection() {
  return (
    <div>
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
        <div className="text-4xl mb-3">🛒</div>
        <h1 className="text-2xl font-black mb-2">ChatCart Documentation</h1>
        <p className="text-purple-100 text-sm">Africa's WhatsApp-powered marketplace — complete developer guide.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["React 19", "NestJS", "PostgreSQL", "Redis", "Meilisearch", "TypeScript"].map(t => (
            <span key={t} className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <H2><BookOpen className="w-5 h-5 text-purple-600" />What is ChatCart?</H2>
      <P>ChatCart is a full-stack marketplace platform that enables buying, selling, renting, booking, and hiring services across East Africa — with WhatsApp as the primary communication channel.</P>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          { icon: "🛍", title: "6 Categories", desc: "Products, Property, Vehicles, Stays, Services, Quick Sell" },
          { icon: "💬", title: "WhatsApp-First", desc: "Every listing has a pre-filled WhatsApp contact button" },
          { icon: "💳", title: "Africa Payments", desc: "MTN MoMo, Airtel Money, Stripe" },
          { icon: "🛡", title: "Admin Console", desc: "Full platform management dashboard with analytics" },
          { icon: "🔔", title: "Push Notifications", desc: "FCM, SMS (Africa's Talking), Email (SendGrid)" },
          { icon: "🌍", title: "Multi-country", desc: "Uganda (UGX), Kenya (KES), Tanzania (TZS)" },
        ].map(f => (
          <div key={f.title} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div><p className="font-bold text-gray-800 text-sm">{f.title}</p><p className="text-xs text-gray-500">{f.desc}</p></div>
          </div>
        ))}
      </div>

      <H2><Layers className="w-5 h-5 text-blue-600" />Tech Stack</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-gray-50">
            {["Layer","Technology","Version","Purpose"].map(h => (
              <th key={h} className="text-left px-3 py-2 text-xs font-bold text-gray-600 uppercase border border-gray-200">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[
              ["Frontend","React + Vite","19.x / 7.x","UI Framework"],
              ["Styling","Tailwind CSS","4.x","Utility CSS"],
              ["State","Zustand + React Query","5.x / 5.x","Global + server state"],
              ["Backend","NestJS (Node.js)","10.x","REST API + WebSocket"],
              ["Database","PostgreSQL","16","Primary data store"],
              ["Cache","Redis","7.x","Sessions, OTP, rate limits"],
              ["Search","Meilisearch","1.11","Full-text listing search"],
              ["Storage","Cloudflare R2","—","Images + files (S3-compatible)"],
              ["Auth","JWT + Passport","—","Access + refresh tokens"],
              ["Mobile","Flutter","3.x","Android + iOS app"],
            ].map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 text-xs text-gray-700 border border-gray-200 font-mono">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2><FileText className="w-5 h-5 text-green-600" />File: src/lib/hooks.ts — Mock Mode</H2>
      <P>The frontend ships with a complete mock data layer. Set <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-purple-700">USE_MOCK = false</code> when your backend is ready:</P>
      <CodeBlock lang="typescript" code={`// src/lib/hooks.ts — Line 14
const USE_MOCK = true;  // ← Change to false when backend is connected

// All API hooks automatically switch to real endpoints.
// No other changes needed.`} />
    </div>
  );
}

function InstallationSection() {
  return (
    <div>
      <H2><Terminal className="w-5 h-5 text-blue-600" />Prerequisites</H2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-gray-50">
            {["Tool","Required Version","Check Command"].map(h => (
              <th key={h} className="text-left px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[
              ["Node.js", "≥ 20.x LTS", "node --version"],
              ["npm", "≥ 10.x", "npm --version"],
              ["PostgreSQL", "≥ 16", "psql --version"],
              ["Redis", "≥ 7.x", "redis-server --version"],
              ["Git", "≥ 2.x", "git --version"],
              ["Docker (optional)", "≥ 24.x", "docker --version"],
            ].map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 text-xs text-gray-700 border border-gray-200 font-mono">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2><Package className="w-5 h-5 text-purple-600" />Frontend Setup (3 Minutes)</H2>
      <CodeBlock lang="bash" code={`# 1. Clone the repository
git clone https://github.com/your-org/chatcart.git
cd chatcart/frontend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 4. Start development server
npm run dev
# ✅ App runs at: http://localhost:5173

# 5. Build for production
npm run build
# Output: dist/index.html (single self-contained file)`} />

      <H2><Server className="w-5 h-5 text-indigo-600" />Backend Setup</H2>
      <CodeBlock lang="bash" code={`cd chatcart/backend

# Install NestJS CLI
npm install -g @nestjs/cli

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in: DB_HOST, DB_PASS, REDIS_PASS, JWT_SECRET, etc.

# Run database migrations
npm run migration:run

# Seed initial data (admin user, plans, categories)
npm run seed

# Start development server
npm run start:dev
# ✅ API runs at: http://localhost:3001
# ✅ Swagger docs: http://localhost:3001/api`} />

      <H2><Globe className="w-5 h-5 text-teal-600" />Docker (All-in-One)</H2>
      <P>Start the entire stack with one command:</P>
      <CodeBlock lang="bash" code={`# From project root
docker compose up -d

# Services started:
# Frontend  → http://localhost:5173
# Backend   → http://localhost:3001
# Postgres  → localhost:5432
# Redis     → localhost:6379
# Meili     → http://localhost:7700

# View logs
docker compose logs -f chatcart-api

# Stop all
docker compose down`} />

      <H2><Database className="w-5 h-5 text-green-600" />Install PostgreSQL (Ubuntu)</H2>
      <CodeBlock lang="bash" code={`sudo apt-get install -y postgresql-16
sudo systemctl start postgresql

sudo -u postgres psql << EOF
CREATE USER chatcart_user WITH PASSWORD 'your_password';
CREATE DATABASE chatcart_db OWNER chatcart_user;
GRANT ALL PRIVILEGES ON DATABASE chatcart_db TO chatcart_user;
\\q
EOF

# Verify
psql -U chatcart_user -d chatcart_db -c "SELECT version();"`} />

      <H2><Zap className="w-5 h-5 text-yellow-600" />Install Redis (Ubuntu)</H2>
      <CodeBlock lang="bash" code={`sudo apt-get install -y redis-server
sudo systemctl start redis-server
redis-cli ping  # Should return: PONG`} />
    </div>
  );
}

function EnvSection() {
  return (
    <div>
      <H2><Shield className="w-5 h-5 text-orange-600" />Frontend Variables (VITE_)</H2>
      <P>Vite only exposes variables prefixed with <code className="bg-gray-100 px-1 rounded text-xs font-mono">VITE_</code> to the browser bundle. Never use server secrets here.</P>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800 text-sm">Security Rule</p>
          <p className="text-xs text-amber-700">Never commit <code className="font-mono">.env</code> to git. Only commit <code className="font-mono">.env.example</code> with placeholder values. Add <code className="font-mono">.env</code> to <code className="font-mono">.gitignore</code>.</p>
        </div>
      </div>

      <CodeBlock lang="env" code={`# ─── Required ─────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_WS_URL=ws://localhost:3001
VITE_WHATSAPP_PHONE=256700000000

# ─── Google OAuth (enables Google login button) ────────────
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com

# ─── Firebase Push Notifications ──────────────────────────
VITE_FCM_VAPID_KEY=BNxxxxxx...

# ─── Meilisearch Search ────────────────────────────────────
VITE_MEILISEARCH_URL=http://localhost:7700
VITE_MEILISEARCH_KEY=public_search_key_only

# ─── Cloudflare R2 CDN ────────────────────────────────────
VITE_CLOUDFLARE_R2_URL=https://cdn.chatcart.africa

# ─── Error Tracking ────────────────────────────────────────
VITE_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0`} />

      <H2><Server className="w-5 h-5 text-indigo-600" />Backend Variables (Secret)</H2>
      <CodeBlock lang="env" code={`# ─── App ─────────────────────────────────────────────────
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://chatcart.africa
ALLOWED_ORIGINS=https://chatcart.africa

# ─── PostgreSQL ──────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/chatcart_db?sslmode=require

# ─── Redis ───────────────────────────────────────────────
REDIS_URL=redis://:password@localhost:6379

# ─── JWT (generate with: openssl rand -hex 64) ───────────
JWT_SECRET=your_256_bit_random_secret_never_share
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another_completely_different_secret
JWT_REFRESH_EXPIRES_IN=30d

# ─── Africa's Talking (OTP SMS) ──────────────────────────
AT_USERNAME=chatcart
AT_API_KEY=atsk_xxx
AT_SENDER_ID=ChatCart
AT_ENVIRONMENT=production

# ─── MTN Mobile Money ────────────────────────────────────
MTN_MOMO_BASE_URL=https://proxy.momoapi.mtn.com
MTN_MOMO_COLLECTION_USER_ID=uuid-here
MTN_MOMO_COLLECTION_API_KEY=api-key-here
MTN_MOMO_COLLECTION_PRIMARY_KEY=primary-key-here
MTN_MOMO_CURRENCY=UGX
MTN_MOMO_CALLBACK_URL=https://api.chatcart.africa/v1/payments/mtn/callback

# ─── Airtel Money ────────────────────────────────────────
AIRTEL_CLIENT_ID=client-id
AIRTEL_CLIENT_SECRET=client-secret
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_COUNTRY=UG

# ─── Stripe ──────────────────────────────────────────────
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# ─── Firebase FCM ────────────────────────────────────────
FIREBASE_PROJECT_ID=chatcart-africa
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@chatcart-africa.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\\n..."

# ─── SendGrid ────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@chatcart.africa

# ─── Cloudflare R2 ───────────────────────────────────────
CF_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=chatcart-media
R2_PUBLIC_URL=https://cdn.chatcart.africa

# ─── Meilisearch ─────────────────────────────────────────
MEILISEARCH_HOST=https://search.chatcart.africa
MEILISEARCH_MASTER_KEY=master_key_never_expose

# ─── WhatsApp Business API ───────────────────────────────
WA_PHONE_NUMBER_ID=phone-number-id
WA_ACCESS_TOKEN=EAAxx...
WA_VERIFY_TOKEN=random_verify_token`} />

      <H2><Code2 className="w-5 h-5 text-gray-600" />Generate Secrets</H2>
      <CodeBlock lang="bash" code={`# JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption key
openssl rand -hex 32

# Random webhook verify token
openssl rand -base64 16`} />
    </div>
  );
}

function ServicesSection() {
  const services = [
    { name: "Africa's Talking", icon: "📱", purpose: "Phone OTP, SMS alerts", url: "https://africastalking.com", status: "required", region: "UG/KE/TZ", cost: "~$0.017/SMS" },
    { name: "MTN Mobile Money", icon: "💛", purpose: "UGX payments (primary)", url: "https://momodeveloper.mtn.com", status: "required", region: "Uganda", cost: "1.5% per txn" },
    { name: "Airtel Money", icon: "🔴", purpose: "UGX/KES/TZS payments", url: "https://developers.airtel.africa", status: "required", region: "UG/KE/TZ", cost: "1.5% per txn" },
    { name: "Stripe", icon: "💳", purpose: "Card payments (international)", url: "https://stripe.com", status: "required", region: "Global", cost: "2.9% + $0.30" },
    { name: "Firebase FCM", icon: "🔔", purpose: "Push notifications", url: "https://firebase.google.com", status: "required", region: "Global", cost: "Free" },
    { name: "SendGrid", icon: "📧", purpose: "Transactional email", url: "https://sendgrid.com", status: "required", region: "Global", cost: "Free → $15/mo" },
    { name: "Cloudflare R2", icon: "☁️", purpose: "Image storage + CDN", url: "https://cloudflare.com/r2", status: "required", region: "Global", cost: "$0.015/GB" },
    { name: "Meilisearch", icon: "🔍", purpose: "Full-text listing search", url: "https://meilisearch.com", status: "required", region: "Cloud/Self-host", cost: "Free → $30/mo" },
    { name: "Google OAuth", icon: "G", purpose: "Social login", url: "https://console.cloud.google.com", status: "optional", region: "Global", cost: "Free" },
    { name: "Apple Sign In", icon: "🍎", purpose: "iOS App Store login", url: "https://developer.apple.com", status: "optional", region: "iOS only", cost: "$99/yr (DevAcc)" },
    { name: "WhatsApp Business", icon: "💬", purpose: "Automated messages", url: "https://developers.facebook.com", status: "optional", region: "Global", cost: "Free → per msg" },
    { name: "Sentry", icon: "🐛", purpose: "Error monitoring", url: "https://sentry.io", status: "recommended", region: "Global", cost: "Free → $26/mo" },
  ];

  return (
    <div>
      <H2><Globe className="w-5 h-5 text-green-600" />All Third-Party Services</H2>
      <P>ChatCart depends on these external services. Click each for setup instructions.</P>
      <div className="space-y-3">
        {services.map(s => (
          <div key={s.name} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-purple-200 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <Badge label={s.status} color={s.status === "required" ? "border-red-200 text-red-600 bg-red-50" : s.status === "recommended" ? "border-orange-200 text-orange-600 bg-orange-50" : "border-gray-200 text-gray-600 bg-gray-50"} />
              </div>
              <p className="text-xs text-gray-500">{s.purpose} · {s.region} · {s.cost}</p>
            </div>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-purple-50 hover:border-purple-200 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="font-bold text-green-800 text-sm">Already Working — No Setup Needed</p>
        </div>
        <p className="text-xs text-green-700">The <strong>"Buy on WhatsApp"</strong> button works immediately using deep links (<code className="font-mono">wa.me/...</code>) — no WhatsApp Business API required. It opens WhatsApp with a pre-filled message containing full listing details.</p>
      </div>
    </div>
  );
}

function DeploymentSection() {
  return (
    <div>
      <H2><Zap className="w-5 h-5 text-rose-600" />Recommended Stack (Startup Budget)</H2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-gray-50">
            {["Component","Provider","Monthly Cost","Why"].map(h => (
              <th key={h} className="text-left px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[
              ["Frontend","Cloudflare Pages","FREE ✅","Global CDN, instant deploys"],
              ["Backend","Railway","$5–20","Auto-scale, simple deploy"],
              ["Database","Supabase","Free → $25","Managed PostgreSQL, backups"],
              ["Redis","Upstash","Free → $10","Serverless Redis"],
              ["Search","Meilisearch Cloud","Free → $30","100K docs free"],
              ["Images","Cloudflare R2","~$1–5","S3-compatible, cheap"],
              ["Email","SendGrid","Free","100 emails/day free"],
              ["Push","Firebase","Free","No limits on FCM"],
              ["Errors","Sentry","Free","5K errors/month free"],
              ["TOTAL","—","~$6–75/month","Scale as you grow"],
            ].map((row, i) => (
              <tr key={i} className={i === 9 ? "bg-purple-50 font-bold" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 text-xs text-gray-700 border border-gray-200">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2><Globe className="w-5 h-5 text-blue-600" />Deploy Frontend to Cloudflare Pages</H2>
      <CodeBlock lang="bash" code={`npm run build   # Creates dist/index.html

# Via CLI
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name chatcart

# Or via GitHub Actions (see .github/workflows/deploy.yml)
# Push to main branch → auto-deploy`} />

      <H2><Server className="w-5 h-5 text-indigo-600" />Deploy Backend with PM2</H2>
      <CodeBlock lang="bash" code={`# On your Ubuntu VPS
npm install -g pm2
cd /var/www/chatcart/backend
npm run build
pm2 start dist/main.js --name chatcart-api --instances 2 --exec-mode cluster
pm2 save && pm2 startup`} />

      <H2><Shield className="w-5 h-5 text-green-600" />SSL with Let's Encrypt</H2>
      <CodeBlock lang="bash" code={`sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d chatcart.africa -d api.chatcart.africa
# Auto-renews every 90 days`} />

      <H2><GitBranch className="w-5 h-5 text-purple-600" />CI/CD (GitHub Actions)</H2>
      <CodeBlock lang="yaml" code={`# .github/workflows/deploy.yml
name: Deploy ChatCart
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run build
        env:
          VITE_API_BASE_URL: \${{ secrets.VITE_API_BASE_URL }}
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          projectName: chatcart
          directory: frontend/dist`} />
    </div>
  );
}

function BackendSection() {
  return (
    <div>
      <H2><Server className="w-5 h-5 text-indigo-600" />NestJS Module Structure</H2>
      <CodeBlock lang="bash" code={`src/
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
├── upload/        # Cloudflare R2 file handling
├── admin/         # Stats, moderation, user mgmt
└── common/        # Guards, pipes, interceptors`} />

      <H2><Code2 className="w-5 h-5 text-gray-600" />API Response Format</H2>
      <CodeBlock lang="json" code={`// All endpoints return this shape:
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "total": 1240,
    "page": 1,
    "limit": 20,
    "totalPages": 62,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

// Error responses:
{
  "success": false,
  "message": "Phone number is required",
  "statusCode": 400,
  "errors": {
    "phone": ["Must be a valid E.164 phone number"]
  }
}`} />

      <H2><Shield className="w-5 h-5 text-blue-600" />Key Endpoints</H2>
      <div className="space-y-1.5 text-xs font-mono">
        {[
          ["POST",   "/auth/otp/send",                "Send OTP via SMS"],
          ["POST",   "/auth/otp/verify",              "Verify OTP → return JWT tokens"],
          ["POST",   "/auth/google",                  "Google OAuth login"],
          ["POST",   "/auth/refresh",                 "Refresh access token"],
          ["GET",    "/listings",                     "List/filter listings (paginated)"],
          ["POST",   "/listings",                     "Create listing (multipart)"],
          ["GET",    "/listings/:id",                 "Get listing detail"],
          ["GET",    "/listings/featured",            "Get featured listings"],
          ["POST",   "/listings/:id/whatsapp-click",  "Track WhatsApp lead"],
          ["POST",   "/upload/image",                 "Upload to Cloudflare R2"],
          ["POST",   "/payments/subscribe",           "Subscribe to plan"],
          ["POST",   "/payments/mtn/callback",        "MTN MoMo webhook"],
          ["POST",   "/payments/stripe/webhook",      "Stripe webhook"],
          ["POST",   "/whatsapp/webhook",             "WhatsApp Business webhook"],
          ["GET",    "/admin/stats",                  "Platform statistics"],
          ["GET",    "/health",                       "System health check"],
        ].map(([method, path, desc]) => (
          <div key={path} className="flex items-center gap-2 py-1.5 border-b border-gray-100">
            <span className={`w-12 text-center text-[10px] font-black rounded px-1 py-0.5 ${method === "GET" ? "bg-blue-100 text-blue-700" : method === "POST" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{method}</span>
            <span className="text-gray-800 flex-1">{path}</span>
            <span className="text-gray-400 text-[10px] hidden sm:block">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DatabaseSection() {
  return (
    <div>
      <H2><Database className="w-5 h-5 text-teal-600" />Core Tables</H2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[
          { table: "users", cols: "id, phone, email, role, subscription_plan, country, is_verified, is_banned", key: "UUID PK" },
          { table: "listings", cols: "id, title, slug, price, currency, category, seller_id, status, attributes (JSONB), location (JSONB)", key: "UUID PK" },
          { table: "stores", cols: "id, user_id, name, slug, whatsapp_number, categories, is_verified, plan", key: "UUID PK" },
          { table: "orders", cols: "id, order_number, listing_id, buyer_id, seller_id, total_amount, status, payment_method", key: "UUID PK" },
          { table: "payments", cols: "id, order_id, user_id, amount, method, status, reference, provider_data (JSONB)", key: "UUID PK" },
          { table: "subscriptions", cols: "id, user_id, plan, status, price, current_period_end, auto_renew", key: "UUID PK" },
          { table: "reviews", cols: "id, listing_id, seller_id, reviewer_id, rating, comment, is_verified_purchase", key: "UUID PK" },
          { table: "notifications", cols: "id, user_id, type, title, body, is_read, data (JSONB)", key: "UUID PK" },
          { table: "whatsapp_leads", cols: "id, listing_id, seller_id, buyer_phone, status, converted_at", key: "UUID PK" },
          { table: "wishlist_items", cols: "user_id, listing_id, created_at", key: "Composite PK" },
          { table: "login_sessions", cols: "id, user_id, refresh_token, device_name, platform, ip_address, expires_at", key: "UUID PK" },
          { table: "reports", cols: "id, reporter_id, target_type, target_id, reason, status", key: "UUID PK" },
        ].map(t => (
          <div key={t.table} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs font-black text-purple-700 font-mono">{t.table}</code>
              <span className="text-[10px] text-gray-400">{t.key}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">{t.cols}</p>
          </div>
        ))}
      </div>

      <H2><Terminal className="w-5 h-5 text-green-600" />Migration Commands</H2>
      <CodeBlock lang="bash" code={`# Generate new migration
npm run migration:generate -- -n CreateListingsTable

# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Seed development data
npm run seed`} />

      <H2><Zap className="w-5 h-5 text-amber-600" />Daily Cron Jobs</H2>
      <CodeBlock lang="typescript" code={`// Scheduled via @nestjs/schedule

// Daily at 2 AM — expire old listings
@Cron('0 2 * * *')
async expireListings() { ... }

// Daily at 2:30 AM — expire subscriptions + downgrade users
@Cron('30 2 * * *')
async expireSubscriptions() { ... }

// Hourly — clean expired Redis OTP sessions
// (Handled automatically by Redis TTL)

// Weekly — send seller analytics digest emails
@Cron('0 9 * * 1')  // Monday 9 AM
async weeklySellerDigest() { ... }`} />
    </div>
  );
}

function ContributingSection() {
  return (
    <div>
      <H2><GitBranch className="w-5 h-5 text-amber-600" />Branch Strategy</H2>
      <CodeBlock lang="bash" code={`main        → Production (deploy on push)
develop     → Integration branch (staging)
feature/*   → New features (branch from develop)
fix/*       → Bug fixes
hotfix/*    → Critical production fixes
docs/*      → Documentation only`} />

      <H2><FileText className="w-5 h-5 text-blue-600" />Commit Convention</H2>
      <CodeBlock lang="bash" code={`# Format: type(scope): description

feat(auth):     add phone OTP login
fix(listings):  prevent duplicate leads
docs(deploy):   add Railway guide
perf(search):   cache Meilisearch results in Redis
chore(deps):    upgrade React to 19.2.6

# Types: feat | fix | docs | style | refactor | perf | test | chore
# Scopes: auth | listings | payments | whatsapp | admin | search | db | ui`} />

      <H2><CheckCircle2 className="w-5 h-5 text-green-600" />PR Checklist</H2>
      <div className="space-y-2">
        {[
          "npm run build passes without errors",
          "npm run test passes (all tests green)",
          "npx tsc --noEmit — no TypeScript errors",
          "No console.log statements in production code",
          "No sensitive data (tokens, passwords) in code",
          "Mobile responsive — tested on 375px width",
          "Documentation updated if adding new features",
          "At least 1 reviewer approval before merging",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-5 h-5 rounded border-2 border-gray-300 shrink-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-purple-600 rounded-sm" />
            </div>
            {item}
          </div>
        ))}
      </div>

      <H2><Shield className="w-5 h-5 text-red-600" />Report Security Issues</H2>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="font-bold text-red-800 text-sm mb-1">⚠️ Do NOT open public GitHub issues for security bugs</p>
        <p className="text-xs text-red-700">Email <strong>security@chatcart.africa</strong> with: description, reproduction steps, impact, and suggested fix. We respond within 24 hours.</p>
      </div>
    </div>
  );
}

const sectionContent: Record<DocSection, React.ReactNode> = {
  overview:     <OverviewSection />,
  installation: <InstallationSection />,
  env:          <EnvSection />,
  services:     <ServicesSection />,
  backend:      <BackendSection />,
  database:     <DatabaseSection />,
  deployment:   <DeploymentSection />,
  contributing: <ContributingSection />,
};

export default function DocsPage({ onNavigate }: Props) {
  const [active, setActive] = useState<DocSection>("overview");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Documentation</h1>
            <p className="text-sm text-gray-500">Complete guide to installing, configuring & deploying ChatCart</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 mt-4">
          <a href="https://github.com/your-org/chatcart" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium">
            <GitBranch className="w-3.5 h-3.5" /> GitHub
          </a>
          <button onClick={() => onNavigate("roadmap")}
            className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors font-medium">
            <BarChart3 className="w-3.5 h-3.5" /> Roadmap
          </button>
          <button onClick={() => onNavigate("admin")}
            className="flex items-center gap-1.5 text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium">
            <Shield className="w-3.5 h-3.5" /> Admin Console
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-48 shrink-0 gap-1 sticky top-20 self-start">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActive(sec.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                active === sec.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <sec.icon className={`w-4 h-4 shrink-0 ${active === sec.id ? "text-white" : sec.color}`} />
              {sec.label}
            </button>
          ))}
        </aside>

        {/* Mobile section tabs */}
        <div className="md:hidden w-full overflow-x-auto pb-3 mb-4 -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {sections.map(sec => (
              <button key={sec.id} onClick={() => setActive(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${active === sec.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                <sec.icon className="w-3.5 h-3.5" />{sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm">
          {sectionContent[active]}

          {/* Prev / Next */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
            {sections.findIndex(s => s.id === active) > 0 ? (
              <button
                onClick={() => setActive(sections[sections.findIndex(s => s.id === active) - 1].id)}
                className="text-sm text-gray-500 hover:text-purple-600 font-medium flex items-center gap-1 transition-colors"
              >
                ← {sections[sections.findIndex(s => s.id === active) - 1].label}
              </button>
            ) : <div />}
            {sections.findIndex(s => s.id === active) < sections.length - 1 && (
              <button
                onClick={() => setActive(sections[sections.findIndex(s => s.id === active) + 1].id)}
                className="text-sm text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 transition-colors"
              >
                {sections[sections.findIndex(s => s.id === active) + 1].label} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
