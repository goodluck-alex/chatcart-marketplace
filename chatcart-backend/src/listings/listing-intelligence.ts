export interface ListingDraftSuggestion {
  title: string;
  category: string;
  description: string;
  tags: string[];
  brand?: string;
}

export interface ListingQualityCheck {
  duplicate: boolean;
  spam: boolean;
  needsAvailabilityConfirmation: boolean;
  issues: string[];
}

export interface PromotionCopy {
  caption: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  x: string;
  telegram: string;
}

const COUNTRY_CURRENCIES: Record<string, string> = {
  UG: 'UGX', KE: 'KES', TZ: 'TZS', RW: 'RWF', ET: 'ETB', NG: 'NGN', ZA: 'ZAR', GH: 'GHS', US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', IN: 'INR', JP: 'JPY', SA: 'SAR', AE: 'AED', QA: 'QAR', EG: 'EGP', MA: 'MAD', CN: 'CNY', BR: 'BRL', AR: 'ARS', MX: 'MXN', PK: 'PKR', BD: 'BDT', LK: 'LKR', MY: 'MYR', SG: 'SGD', PH: 'PHP', TH: 'THB', VN: 'VND', ID: 'IDR', NZ: 'NZD', SE: 'SEK', NO: 'NOK', DK: 'DKK', NL: 'EUR', BE: 'EUR', PT: 'EUR', GR: 'EUR', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN', HR: 'EUR', SI: 'EUR', SK: 'EUR', IE: 'EUR', AT: 'EUR', FI: 'EUR', LV: 'EUR', LT: 'EUR', EE: 'EUR', LU: 'EUR', CY: 'EUR', MT: 'EUR', IS: 'ISK', IL: 'ILS', TR: 'TRY', RU: 'RUB', UA: 'UAH', KR: 'KRW', HK: 'HKD', TW: 'TWD', CL: 'CLP', CO: 'COP', PE: 'PEN', CR: 'CRC', DO: 'DOP', PA: 'PAB', JM: 'JMD', ZM: 'ZMW', BW: 'BWP', MZ: 'MZN', SD: 'SDG', SS: 'SSP', CM: 'XAF', CD: 'CDF', BF: 'XOF', CI: 'XOF', SN: 'XOF', ML: 'XOF', NE: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF', GM: 'GMD', SL: 'SLL', LR: 'LRD',
};

function normalize(value?: string) { return (value || '').trim().toLowerCase(); }

export function detectLocation(input: { city?: string; district?: string; region?: string; area?: string; country?: string; displayAddress?: string }) {
  const country = (input.country || 'UG').toUpperCase();
  return {
    city: input.city || 'Unknown city',
    district: input.district || input.region || input.area || '',
    country,
    displayAddress: input.displayAddress || `${input.city || 'Unknown city'}, ${country}`,
  };
}

export function resolveCurrency(country?: string) {
  const code = (country || 'UG').toUpperCase();
  return COUNTRY_CURRENCIES[code] || 'USD';
}

export function suggestListingDraft(input: { title?: string; description?: string; category?: string; imageCount?: number; location?: any; sellerCountry?: string }): ListingDraftSuggestion {
  const title = normalize(input.title);
  const description = normalize(input.description);
  const category = input.category || inferCategory(title || description, description);
  const brand = inferBrand(title || description, description);
  const fallbackTitle = title || inferTitleFromContent(category, description, input.imageCount || 0);
  const fallbackDescription = description || `Quality ${category.toLowerCase()} listed for sale in ${input.location?.city || 'your area'}.`;
  const tags = inferTags(category, fallbackTitle, fallbackDescription);
  return {
    title: fallbackTitle ? titleCase(fallbackTitle) : `${category} listing`,
    category,
    description: fallbackDescription ? sentenceCase(fallbackDescription) : `${category} listed for sale.`,
    tags,
    brand: brand || undefined,
  };
}

export function evaluateListingQuality(title?: string, description?: string, existingTitles: string[] = []): ListingQualityCheck {
  const haystack = `${title || ''} ${description || ''}`.toLowerCase();
  const issues: string[] = [];
  const duplicate = existingTitles.some(item => normalize(item).includes(normalize(title || '')) || normalize(title || '').includes(normalize(item)));
  const spam = /free money|click here|buy now|guaranteed|urgent|cash out|make money|limited time/i.test(haystack);
  if (duplicate) issues.push('Similar listing detected');
  if (spam) issues.push('Spam-like wording detected');
  return {
    duplicate,
    spam,
    needsAvailabilityConfirmation: duplicate || spam,
    issues,
  };
}

export function generatePromotions(payload: { title: string; description?: string; city?: string; currency?: string; price?: number }) : PromotionCopy {
  const title = payload.title || 'Great listing';
  const city = payload.city || 'your area';
  const price = payload.price ? `${payload.currency || 'UGX'} ${payload.price.toLocaleString()}` : 'check price';
  const caption = `${title} is now available in ${city}. Price: ${price}. Message me directly on WhatsApp to enquire.`;
  return {
    caption,
    whatsapp: `Hello 👋 I saw your listing for ${title} in ${city}. Price: ${price}. I would like to know more.`,
    facebook: `${title} available in ${city} for ${price}. DM me for details.`,
    instagram: `New listing alert: ${title} in ${city}. Price ${price}. Tap to enquire.`,
    x: `New listing: ${title} in ${city} for ${price}. Send a message to enquire.`,
    telegram: `New listing: ${title} in ${city}. Price ${price}. Message me for details.`,
  };
}

export function scoreListingForDiscovery(listing: { views?: number; createdAt?: Date | string; isFeatured?: boolean; isSponsored?: boolean; category?: string; location?: any; price?: number; seller?: any; attributes?: any }) {
  const created = listing.createdAt ? new Date(listing.createdAt).getTime() : Date.now();
  const freshnessHours = Math.max(1, (Date.now() - created) / (1000 * 60 * 60));
  const freshnessScore = Math.max(0, 100 - freshnessHours / 24);
  const popularityScore = (listing.views || 0) * 0.4 + (listing.isFeatured ? 40 : 0) + (listing.isSponsored ? 20 : 0);
  const locationScore = (listing.location?.city || '').toString().toLowerCase().includes('kampala') ? 25 : 10;
  const priceScore = listing.price && listing.price > 0 ? Math.min(20, Math.max(5, 20 - Math.round(listing.price / 1000000))) : 10;
  const qualityScore = (listing.attributes?.qualityCheck?.spam || listing.attributes?.qualityCheck?.duplicate) ? -25 : 15;
  const sellerScore = listing.seller?.isVerified ? 15 : 0;
  const categoryBonus = (listing.category === 'Products' || listing.category === 'Vehicles') ? 10 : 0;
  return Math.max(0, Math.round(freshnessScore + popularityScore + locationScore + priceScore + qualityScore + sellerScore + categoryBonus));
}

function inferCategory(title: string, description: string = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (/(house|apartment|land|rent|room|villa|suite|property)/.test(text)) return 'Property';
  if (/(car|vehicle|motorbike|bike|truck|bus|van|automobile|toyota|bmw|honda)/.test(text)) return 'Vehicles';
  if (/(hotel|stay|airbnb|cabin|room|suite|hostel)/.test(text)) return 'Stays';
  if (/(service|repair|consult|design|marketing|plumbing|cleaning|delivery)/.test(text)) return 'Services';
  return 'Products';
}

function inferTitleFromContent(category: string, description: string, imageCount: number) {
  const base = description.split(/[.!?]/)[0] || `${category} listing`;
  if (imageCount > 1) return `${base} (${imageCount} photos)`;
  return base;
}

function inferTags(category: string, title: string, description: string) {
  const seed = [category.toLowerCase(), ...title.split(/\s+/).filter(Boolean).slice(0, 4)];
  const tags = new Set(seed);
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('new')) tags.add('new');
  if (text.includes('used')) tags.add('used');
  if (text.includes('urgent')) tags.add('urgent');
  if (text.includes('delivery')) tags.add('delivery');
  return Array.from(tags).slice(0, 6);
}

function inferBrand(title: string, description: string = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('iphone')) return 'Apple';
  if (text.includes('samsung')) return 'Samsung';
  if (text.includes('macbook')) return 'Apple';
  if (text.includes('toyota')) return 'Toyota';
  if (text.includes('nokia')) return 'Nokia';
  return undefined;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, char => char.toUpperCase());
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
