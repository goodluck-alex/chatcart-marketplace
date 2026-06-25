interface Props { onNavigate: (page: string) => void; }

export default function Footer({ onNavigate }: Props) {
  const WAIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  const links = {
    Categories: [
      { label: "🛍 Products",   page: "listings" },
      { label: "🏠 Property",   page: "listings" },
      { label: "🚗 Vehicles",   page: "listings" },
      { label: "🛏 Stays",      page: "listings" },
      { label: "🔧 Services",   page: "listings" },
      { label: "📦 Quick Sell", page: "listings" },
    ],
    Company: [
      { label: "About Us",       page: "home"    },
      { label: "How It Works",   page: "home"    },
      { label: "Seller Plans",   page: "pricing" },
      { label: "📚 Developer Docs", page: "docs" },
      { label: "⚠️ Roadmap",    page: "roadmap" },
      { label: "🛡 Admin",       page: "admin"   },
    ],
    Support: [
      { label: "Help Center",        page: "home" },
      { label: "Safety Tips",        page: "home" },
      { label: "Report a Listing",   page: "home" },
      { label: "Privacy Policy",     page: "home" },
      { label: "Terms of Service",   page: "home" },
      { label: "Contact Us",         page: "home" },
    ],
  };

  return (
    <footer className="bg-gray-950 text-white hidden md:block mt-16">
      {/* Top wave */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#7c3aed,#4f46e5,#a855f7,#7c3aed)", backgroundSize: "200% 100%" }} />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 16px rgba(124,58,237,.4)" }}>
                🛒
              </div>
              <div>
                <div className="text-lg font-black">
                  <span className="text-white">Chat</span>
                  <span style={{ color: "#a855f7" }}>Cart</span>
                </div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Marketplace</div>
              </div>
            </button>

            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Africa's leading WhatsApp-powered marketplace. Buy, sell, rent, book & hire — all in one place.
            </p>

            <div className="flex gap-3 mb-6">
              {[
                { emoji: "▶", sub: "GET IT ON", main: "Google Play" },
                { emoji: "🍎", sub: "Download on the", main: "App Store" },
              ].map(btn => (
                <button key={btn.main}
                  className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-purple-700 text-white text-xs px-3.5 py-2.5 rounded-2xl transition-all">
                  <span className="text-lg">{btn.emoji}</span>
                  <div className="text-left">
                    <div className="text-[9px] text-gray-500">{btn.sub}</div>
                    <div className="font-bold text-[11px]">{btn.main}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* WhatsApp support */}
            <a href="https://wa.me/256700000000?text=Hi! I need help with ChatCart."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all"
              style={{ background: "#25D366" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#128C7E"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#25D366"}>
              <WAIcon /> Chat with Support
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">{group}</h3>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <button onClick={() => onNavigate(item.page)}
                      className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 ChatCart. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["🇺🇬 Uganda","🇰🇪 Kenya","🇹🇿 Tanzania"].map(c => (
              <span key={c} className="text-gray-600 text-xs">{c}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
