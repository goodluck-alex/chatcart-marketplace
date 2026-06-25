import { Check, Zap } from "lucide-react";
import { plans } from "../data/listings";

interface Props {
  onNavigate: (page: string) => void;
}

export default function PricingPage({ onNavigate }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="text-center py-10">
        <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
          <Zap className="w-4 h-4" /> Simple Pricing
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          Choose your plan
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Whether you're selling one item or running a full business, we have a plan for you.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-6 border-2 transition-all ${
              plan.popular
                ? "border-purple-500 shadow-2xl shadow-purple-100 bg-white scale-105"
                : "border-gray-200 bg-white hover:border-purple-200 hover:shadow-lg"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                ✨ Most Popular
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg`}>
              {plan.id === "individual" ? "👤" : plan.id === "starter" ? "🏪" : "🚀"}
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-purple-600">{plan.price}</span>
              <span className="text-gray-400 text-sm">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onNavigate("sell")}
              className={`w-full font-bold py-3 rounded-2xl transition-all ${
                plan.popular
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-200"
                  : "border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Can I switch plans anytime?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately." },
            { q: "What payment methods are supported?", a: "We support MTN Mobile Money, Airtel Money, and Stripe (Visa/Mastercard)." },
            { q: "How does WhatsApp integration work?", a: "When a buyer clicks 'Buy on WhatsApp', they're taken to WhatsApp with a pre-filled message about your listing. You respond normally in WhatsApp, and the lead is tracked in your ChatCart dashboard." },
            { q: "Is there a free trial?", a: "Starter Business and Pro Business plans come with a 7-day free trial. No credit card required." },
            { q: "Can I sell in multiple countries?", a: "Yes! ChatCart supports listings across Uganda, Kenya, Tanzania, and more countries coming soon." },
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{faq.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-2xl font-black mb-2">Still have questions?</h2>
        <p className="text-purple-200 mb-6">Chat with our team on WhatsApp. We reply in minutes.</p>
        <a
          href="https://wa.me/256700000000?text=Hi! I have a question about ChatCart pricing."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-8 py-3 rounded-2xl hover:bg-[#1da851] transition-colors shadow-xl"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat with Us on WhatsApp
        </a>
      </div>
    </div>
  );
}
