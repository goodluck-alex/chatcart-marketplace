export interface AIPreview { title: string; category: string; description: string; tags: string[]; brand?: string; }

export interface OptimizedImage { id: string; name: string; previewUrl: string; file: File; sizeLabel: string; }

export function buildAiSuggestions(input: { title?: string; description?: string; category?: string; location?: { city?: string; country?: string }; imageCount?: number; }): AIPreview {
  const title = (input.title || '').trim();
  const description = (input.description || '').trim();
  const city = input.location?.city || 'your area';
  const category = input.category || inferCategory(`${title} ${description}`);
  const brand = inferBrand(`${title} ${description}`);
  const suggestedTitle = title || `${category} in ${city}`;
  const suggestedDescription = description || `High-quality ${category.toLowerCase()} available in ${city}. Message me directly to arrange pickup or delivery.`;
  return {
    title: suggestedTitle,
    category,
    description: suggestedDescription,
    tags: inferTags(suggestedTitle, suggestedDescription),
    brand,
  };
}

export function generatePromoCopies(input: { title: string; city?: string; currency?: string; price?: number; }) {
  const city = input.city || 'your area';
  const price = input.price ? `${input.currency || 'UGX'} ${input.price.toLocaleString()}` : 'contact for price';
  return {
    caption: `${input.title} is now available in ${city}. Price: ${price}. Message me directly on WhatsApp to enquire.`,
    whatsapp: `Hello 👋 I’m interested in ${input.title} in ${city}. Price: ${price}. Please share more details.`,
    facebook: `${input.title} available in ${city} for ${price}. DM for details.`,
    instagram: `New listing alert: ${input.title} in ${city}. Price ${price}. Tap to enquire.`,
    x: `New listing: ${input.title} in ${city} for ${price}. Message me for details.`,
    telegram: `New listing: ${input.title} in ${city}. Price ${price}. Send me a message.`,
  };
}

export async function createOptimizedImageAsset(file: File): Promise<OptimizedImage> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1200;
  let width = bitmap.width;
  let height = bitmap.height;
  if (width > maxEdge || height > maxEdge) {
    const scale = Math.min(maxEdge / width, maxEdge / height, 1);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to process image');
  const sx = Math.max(0, Math.floor((bitmap.width - Math.min(bitmap.width, bitmap.height)) / 2));
  const sy = Math.max(0, Math.floor((bitmap.height - Math.min(bitmap.width, bitmap.height)) / 2));
  const size = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    previewUrl: dataUrl,
    file: new File([dataUrlToBlob(dataUrl)], file.name, { type: 'image/jpeg' }),
    sizeLabel: formatBytes(file.size),
  };
}

function inferCategory(text: string) {
  const t = text.toLowerCase();
  if (/(house|apartment|land|room|rental|villa|suite)/.test(t)) return 'Property';
  if (/(car|toyota|bmw|motorbike|bike|truck|van|vehicle)/.test(t)) return 'Vehicles';
  if (/(hotel|airbnb|cabin|stay|hostel)/.test(t)) return 'Stays';
  if (/(service|repair|consult|design|plumbing|cleaning|delivery)/.test(t)) return 'Services';
  return 'Products';
}

function inferBrand(text: string) {
  const t = text.toLowerCase();
  if (t.includes('iphone')) return 'Apple';
  if (t.includes('samsung')) return 'Samsung';
  if (t.includes('macbook')) return 'Apple';
  if (t.includes('toyota')) return 'Toyota';
  if (t.includes('nike')) return 'Nike';
  return undefined;
}

function inferTags(title: string, description: string) {
  const tags = new Set<string>([title.split(' ')[0].toLowerCase()]);
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('new')) tags.add('new');
  if (text.includes('used')) tags.add('used');
  if (text.includes('delivery')) tags.add('delivery');
  if (text.includes('whatsapp')) tags.add('whatsapp-ready');
  return Array.from(tags).slice(0, 5);
}

function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(payload);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
