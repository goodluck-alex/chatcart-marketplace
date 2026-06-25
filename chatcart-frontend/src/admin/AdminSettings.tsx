import { useState } from "react";
import { Save, Globe, Bell, CreditCard, Shield, Zap } from "lucide-react";
import toast from "react-hot-toast";

const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Zap },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm">Configure ChatCart platform-wide settings</p>
      </div>

      <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">General Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Platform Name" defaultValue="ChatCart" />
              <Field label="Support Email" defaultValue="support@chatcart.africa" type="email" />
              <Field label="WhatsApp Business Number" defaultValue="+256700000000" />
              <Field label="Default Currency" type="select" options={["UGX", "KES", "TZS", "USD"]} defaultValue="UGX" />
              <Field label="Listing Expiry (days)" defaultValue="30" type="number" />
              <Field label="Max Images per Listing" defaultValue="10" type="number" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Active Countries</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { code: "UG", name: "Uganda", flag: "🇺🇬", active: true },
                  { code: "KE", name: "Kenya", flag: "🇰🇪", active: true },
                  { code: "TZ", name: "Tanzania", flag: "🇹🇿", active: true },
                  { code: "RW", name: "Rwanda", flag: "🇷🇼", active: false },
                  { code: "NG", name: "Nigeria", flag: "🇳🇬", active: false },
                ].map(c => (
                  <label key={c.code} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                    c.active ? "bg-purple-900/40 border-purple-600 text-purple-300" : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}>
                    <input type="checkbox" defaultChecked={c.active} className="accent-purple-500" />
                    <span>{c.flag} {c.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Active Categories</label>
              <div className="flex gap-2 flex-wrap">
                {["🛍 Products","🏠 Property","🚗 Vehicles","🛏 Stays","🔧 Services","📦 Quick Sell"].map(cat => (
                  <label key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-600 bg-purple-900/30 text-purple-300 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-purple-500" /> {cat}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Notification Configuration</h2>
            <div className="space-y-4">
              <Toggle label="New Listing Alerts" desc="Notify admins when new listings are submitted for review" defaultChecked />
              <Toggle label="New User Registrations" desc="Daily summary of new user signups" defaultChecked />
              <Toggle label="Dispute Alerts" desc="Immediate notification when a dispute is raised" defaultChecked />
              <Toggle label="Revenue Reports" desc="Weekly revenue summary to admin email" defaultChecked />
              <Toggle label="System Health Alerts" desc="Notify when any service goes down" defaultChecked />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Firebase FCM Key" defaultValue="•••••••••••••••••••••••••••••••••••" type="password" />
              <Field label="SendGrid API Key" defaultValue="•••••••••••••••••••••••••••••••••••" type="password" />
              <Field label="Africa's Talking API Key" defaultValue="•••••••••••••••••••••••••••••••••••" type="password" />
              <Field label="Africa's Talking Username" defaultValue="chatcart_prod" />
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Payment Gateway Configuration</h2>
            {[
              { name: "MTN Mobile Money", icon: "📱", fields: ["API User ID", "API Key", "Primary Key", "Collection URL"] },
              { name: "Airtel Money", icon: "📡", fields: ["Client ID", "Client Secret", "Callback URL"] },
              { name: "Stripe", icon: "💳", fields: ["Publishable Key", "Secret Key", "Webhook Secret"] },
            ].map(gw => (
              <div key={gw.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{gw.icon}</span>
                    <h3 className="font-bold text-white">{gw.name}</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-400">Enabled</span>
                    <input type="checkbox" defaultChecked className="accent-purple-500" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {gw.fields.map(f => (
                    <Field key={f} label={f} defaultValue="•••••••••••••••••" type="password" compact />
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-bold text-white mb-3">Platform Fees</h3>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Transaction Fee (%)" defaultValue="2.5" type="number" compact />
                <Field label="Featured Listing (UGX/day)" defaultValue="5000" type="number" compact />
                <Field label="Sponsored Store (UGX/month)" defaultValue="150000" type="number" compact />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Security Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="OTP Expiry (minutes)" defaultValue="5" type="number" />
              <Field label="Max Login Attempts" defaultValue="5" type="number" />
              <Field label="JWT Secret" defaultValue="•••••••••••••••••••••••••••••••••••" type="password" />
              <Field label="Refresh Token Expiry (days)" defaultValue="30" type="number" />
              <Field label="Rate Limit (req/min)" defaultValue="100" type="number" />
              <Field label="Session Timeout (hours)" defaultValue="24" type="number" />
            </div>
            <div className="space-y-4">
              <Toggle label="Two-Factor Authentication (Admin)" desc="Require 2FA for all admin accounts" defaultChecked />
              <Toggle label="IP Allowlist for Admin" desc="Restrict admin access to specific IP addresses" />
              <Toggle label="Auto-block suspicious IPs" desc="Automatically block IPs with repeated failed logins" defaultChecked />
              <Toggle label="Email verification required" desc="Require email verification for new sellers" defaultChecked />
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">External Integrations</h2>
            {[
              { name: "Meilisearch", icon: "🔍", status: "connected", fields: ["Host URL", "Master Key", "Search Key"] },
              { name: "Cloudflare R2", icon: "☁️", status: "connected", fields: ["Account ID", "Access Key ID", "Secret Access Key", "Bucket Name"] },
              { name: "Firebase FCM", icon: "🔔", status: "connected", fields: ["Project ID", "Service Account Key (JSON)"] },
              { name: "Google OAuth", icon: "G", status: "connected", fields: ["Client ID", "Client Secret"] },
              { name: "WhatsApp Business API", icon: "💬", status: "pending", fields: ["Phone Number ID", "Access Token", "Verify Token"] },
            ].map(integ => (
              <div key={integ.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{integ.icon}</span>
                    <h3 className="font-bold text-white">{integ.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${integ.status === "connected" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                      {integ.status}
                    </span>
                  </div>
                  <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Test Connection</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {integ.fields.map(f => (
                    <Field key={f} label={f} defaultValue={f.toLowerCase().includes("key") || f.toLowerCase().includes("token") || f.toLowerCase().includes("secret") ? "•••••••••••••••••" : ""} type={f.toLowerCase().includes("key") || f.toLowerCase().includes("token") || f.toLowerCase().includes("secret") ? "password" : "text"} compact />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-purple-900/50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text", options, compact }: {
  label: string; defaultValue?: string; type?: string; options?: string[]; compact?: boolean;
}) {
  return (
    <div>
      <label className={`block font-bold text-gray-400 mb-1 ${compact ? "text-xs" : "text-sm"}`}>{label}</label>
      {type === "select" ? (
        <select defaultValue={defaultValue} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-purple-500">
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className={`w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 ${compact ? "text-xs" : "text-sm"}`}
        />
      )}
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-bold text-gray-200">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-11 h-6 rounded-full transition-all relative ${checked ? "bg-purple-600" : "bg-gray-700"}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
