import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Camera } from "lucide-react";
import { plans } from "../data/listings";
import { buildAiSuggestions, createOptimizedImageAsset, generatePromoCopies, type OptimizedImage } from "../lib/assistant";
import { useCreateListing } from "../lib/hooks";

interface Props {
  onNavigate: (page: string) => void;
}

const listingTypes = [
  { id: "Products", icon: "🛍", title: "Products", desc: "Electronics, fashion, home & more" },
  { id: "Property", icon: "🏠", title: "Property", desc: "Houses, apartments, land for sale or rent" },
  { id: "Vehicles", icon: "🚗", title: "Vehicles", desc: "Cars, motorcycles, trucks & more" },
  { id: "Stays", icon: "🛏", title: "Stays", desc: "Hotels, Airbnb, short stays" },
  { id: "Services", icon: "🔧", title: "Services", desc: "Offer your skills & expertise" },
  { id: "Quick Sell", icon: "📦", title: "Quick Sell", desc: "Sell single items fast" },
];

const categoryFields: Record<string, { label: string; type: string; options?: string[] }[]> = {
  Vehicles: [
    { label: "Make", type: "text" },
    { label: "Model", type: "text" },
    { label: "Year", type: "number" },
    { label: "Mileage (km)", type: "number" },
    { label: "Condition", type: "select", options: ["New", "Used - Excellent", "Used - Good", "Used - Fair"] },
  ],
  Property: [
    { label: "Property Type", type: "select", options: ["Apartment", "House", "Land", "Commercial"] },
    { label: "Bedrooms", type: "number" },
    { label: "Bathrooms", type: "number" },
    { label: "Size (sqm)", type: "number" },
    { label: "Listing Type", type: "select", options: ["For Sale", "For Rent"] },
  ],
  Stays: [
    { label: "Property Type", type: "select", options: ["Hotel", "Airbnb", "Hostel", "Cabin"] },
    { label: "Max Guests", type: "number" },
    { label: "Amenities", type: "text" },
    { label: "Check-in Time", type: "text" },
  ],
  Services: [
    { label: "Service Type", type: "text" },
    { label: "Experience (years)", type: "number" },
    { label: "Availability", type: "select", options: ["Full-time", "Part-time", "Weekends", "24/7"] },
    { label: "Pricing Model", type: "select", options: ["Per Hour", "Per Day", "Fixed Price", "Negotiable"] },
  ],
};

export default function SellPage({ onNavigate }: Props) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    phone: "",
    storeName: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<OptimizedImage[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState(buildAiSuggestions({}));
  const [currency, setCurrency] = useState("UGX");
  const [promoCopy, setPromoCopy] = useState(generatePromoCopies({ title: "Your listing", city: "your area" }));
  const createListing = useCreateListing();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else setSubmitted(true);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const canNext = () => {
    if (step === 1) return !!selectedType;
    if (step === 2) return !!selectedPlan;
    if (step === 3) return formData.title && formData.price && formData.location;
    return true;
  };

  useEffect(() => {
    const suggestion = buildAiSuggestions({
      title: formData.title,
      description: formData.description,
      category: selectedType || undefined,
      location: { city: formData.location || undefined, country: "UG" },
      imageCount: images.length,
    });
    setAiSuggestion(suggestion);
    setPromoCopy(generatePromoCopies({ title: suggestion.title, city: formData.location || 'your area', currency, price: Number(formData.price || 0) }));
  }, [formData.title, formData.description, formData.location, formData.price, images.length, selectedType, currency]);

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const processed = await Promise.all(files.map(createOptimizedImageAsset));
    setImages(prev => [...prev, ...processed]);
  };

  const visibleSuggestions = useMemo(() => [
    { label: "Title", value: aiSuggestion.title },
    { label: "Category", value: aiSuggestion.category },
    { label: "Description", value: aiSuggestion.description },
    { label: "Tags", value: aiSuggestion.tags.join(", ") },
    aiSuggestion.brand ? { label: "Brand", value: aiSuggestion.brand } : null,
  ].filter(Boolean), [aiSuggestion]);

  const handlePublish = () => {
    const fd = new FormData();
    fd.append("title", formData.title || aiSuggestion.title);
    fd.append("description", formData.description || aiSuggestion.description);
    fd.append("price", formData.price || "0");
    fd.append("currency", currency);
    fd.append("category", selectedType);
    fd.append("location", JSON.stringify({ city: formData.location, country: "UG", displayAddress: formData.location }));
    fd.append("tags", aiSuggestion.tags.join(","));
    fd.append("attributes", JSON.stringify({ aiSuggestedCategory: aiSuggestion.category, aiSuggestedBrand: aiSuggestion.brand || "", promoCopy }));
    images.forEach(image => fd.append("images", image.file));
    createListing.mutate(fd, { onSuccess: () => setSubmitted(true) });
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center pb-24 md:pb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-green-200 animate-bounce">
          🎉
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Listing Published!</h2>
        <p className="text-gray-500 mb-2 text-sm">Your listing is now live and visible to thousands of buyers near you.</p>
        <p className="text-sm text-purple-600 font-medium mb-8">Buyers can now reach you directly on WhatsApp.</p>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-bold text-green-800 mb-2">✅ What happens next:</p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Buyers see your listing in the app</li>
            <li>• They click "Buy on WhatsApp"</li>
            <li>• You get a message with their inquiry</li>
            <li>• Chat, negotiate, and close the deal!</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setSubmitted(false); setStep(1); setSelectedType(""); setSelectedPlan(""); setFormData({ title: "", description: "", price: "", location: "", phone: "", storeName: "" }); }}
            className="bg-purple-600 text-white font-bold py-3 rounded-2xl hover:bg-purple-700 transition-colors"
          >
            Post Another Listing
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-2xl hover:border-purple-300 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-28 md:pb-12">
      {/* Header */}
      <div className="py-4 flex items-center gap-3">
        <button onClick={() => step > 1 ? handlePrev() : onNavigate("home")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">
            {step === 1 && "Choose Listing Type"}
            {step === 2 && "Select Your Plan"}
            {step === 3 && "Add Listing Details"}
            {step === 4 && "Create Store Profile"}
          </h1>
          <p className="text-xs text-gray-500">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s <= step ? "bg-purple-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Choose Type */}
      {step === 1 && (
        <div>
          <p className="text-gray-500 text-sm mb-4">What are you listing?</p>
          <div className="grid grid-cols-2 gap-3">
            {listingTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedType === type.id
                    ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-100"
                    : "border-gray-200 bg-white hover:border-purple-200 hover:shadow-md"
                }`}
              >
                {selectedType === type.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="font-bold text-gray-900 text-sm">{type.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose Plan */}
      {step === 2 && (
        <div>
          <p className="text-gray-500 text-sm mb-4">Choose a plan that fits your needs.</p>
          <div className="grid gap-4">
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-100"
                    : "border-gray-200 bg-white hover:border-purple-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white text-lg font-black`}>
                    {plan.id === "individual" ? "1" : plan.id === "starter" ? "S" : "P"}
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{plan.name}</div>
                    <div className="text-purple-600 font-bold text-lg">{plan.price} <span className="text-gray-400 font-normal text-sm">{plan.period}</span></div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Listing Details */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Photos</label>
              <span className="text-xs text-gray-500">Camera • Gallery • Files</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="aspect-square border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all col-span-2 row-span-2 bg-purple-50/60">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelection} />
                <Camera className="w-6 h-6 text-purple-500 mb-1" />
                <span className="text-xs font-semibold text-purple-600">Upload / Capture</span>
                <span className="text-[10px] text-purple-500 mt-1">{images.length ? `${images.length} ready` : 'Add images'}</span>
              </label>
              {images.length ? images.map((image, index) => (
                <div key={image.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={image.previewUrl} alt={image.name} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter(item => item.id !== image.id))} className="absolute top-1 right-1 bg-white/90 rounded-full px-1.5 py-0.5 text-[10px] font-bold">✕</button>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded">{index + 1}</div>
                </div>
              )) : [1, 2, 3].map(i => (
                <div key={i} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/50 transition-all">
                  <Plus className="w-5 h-5 text-gray-300" />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="mt-2 text-xs text-gray-500">Tip: reorder by tapping the image badges and publish after cropping or compressing.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. MacBook Pro M2 2022"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI suggestion: <span className="font-semibold">{aiSuggestion.title}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your listing in detail..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{aiSuggestion.description}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (UGX) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 2500000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location *</label>
              <select
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                <option value="">Select city</option>
                {["Kampala", "Entebbe", "Jinja", "Mbarara", "Masaka", "Gulu", "Mwanza", "Nairobi", "Dar es Salaam"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category-specific fields */}
          {categoryFields[selectedType] && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Additional Details ({selectedType})</label>
              <div className="grid grid-cols-2 gap-3">
                {categoryFields[selectedType].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                    {field.type === "select" ? (
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                        <option value="">Select...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.label}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number</label>
            <div className="flex gap-2">
              <div className="px-3 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600 flex items-center">+256</div>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="7XX XXX XXX"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-800">AI auto-promotion</h3>
            </div>
            <p className="text-xs text-purple-700 mb-3">Your listing can be shared instantly on WhatsApp, Facebook, Instagram, X, and Telegram.</p>
            <div className="rounded-xl bg-white p-3 text-xs text-gray-700 space-y-2">
              <div className="font-semibold">Caption</div>
              <div>{promoCopy.caption}</div>
            </div>
            <div className="mt-3 rounded-xl bg-white p-3 text-xs text-gray-700">
              <div className="font-semibold mb-1">Suggested details</div>
              <ul className="space-y-1">
                {visibleSuggestions.map(item => (
                  <li key={item.label} className="flex gap-2"><span className="text-gray-400">{item.label}:</span><span className="font-medium text-gray-700">{item.value}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Store Profile */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-3 cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-purple-200">
              🏪
            </div>
            <p className="text-xs text-gray-500">Tap to upload store logo</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Store/Business Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="e.g. Trendify Electronics"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Store Description</label>
            <textarea
              rows={3}
              placeholder="Tell buyers about your business..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          {/* Payment */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Payment Method</h3>
            <div className="space-y-2">
              {[
                { id: "mtn", name: "MTN Mobile Money", icon: "📱", color: "bg-yellow-400" },
                { id: "airtel", name: "Airtel Money", icon: "📱", color: "bg-red-500" },
                { id: "stripe", name: "Card (Stripe)", icon: "💳", color: "bg-blue-500" },
              ].map(method => (
                <label key={method.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-purple-200 transition-colors">
                  <input type="radio" name="payment" value={method.id} className="accent-purple-600" />
                  <span className={`w-8 h-8 ${method.color} rounded-lg flex items-center justify-center text-white text-sm`}>{method.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <h3 className="font-bold text-purple-800 mb-2 text-sm">📋 Listing Summary</h3>
            <div className="space-y-1.5 text-sm text-gray-700">
              <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-semibold">{selectedType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Plan:</span> <span className="font-semibold capitalize">{selectedPlan}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Title:</span> <span className="font-semibold">{formData.title || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price:</span> <span className="font-semibold text-purple-600">{formData.price ? `UGX ${parseInt(formData.price).toLocaleString()}` : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span className="font-semibold">{formData.location || "-"}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 md:relative md:border-0 md:bg-transparent md:p-0 md:pt-6">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:border-purple-200 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={step === 4 ? handlePublish : handleNext}
            disabled={!canNext() || createListing.isPending}
            className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-all ${
              canNext() && !createListing.isPending
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {step === 4 ? (createListing.isPending ? "Publishing..." : "Publish Listing 🚀") : "Continue"}
            {step < 4 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
