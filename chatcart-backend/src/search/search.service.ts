import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;
  private index: Index;

  constructor(private cfg: ConfigService) {
    this.client = new MeiliSearch({
      host:   cfg.get('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: cfg.get('MEILISEARCH_MASTER_KEY', ''),
    });
    this.index = this.client.index('listings');
  }

  /** Configure the Meilisearch index on startup */
  async onModuleInit() {
    try {
      await this.index.updateSearchableAttributes([
        'title', 'description', 'tags', 'category', 'location.city', 'seller.firstName', 'store.name',
      ]);
      await this.index.updateFilterableAttributes([
        'category', 'location.city', 'location.country', 'price', 'status',
        'seller.isVerified', 'isFeatured', 'condition', 'currency',
      ]);
      await this.index.updateSortableAttributes(['price', 'views', 'createdAt', 'seller.rating']);
      await this.index.updateSettings({
        typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
        pagination: { maxTotalHits: 10000 },
        rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      });
      this.logger.log('Meilisearch index configured');
    } catch (err) {
      this.logger.warn(`Meilisearch not reachable on startup: ${err?.message}`);
    }
  }

  /** Index (add/update) a listing document */
  async indexListing(listing: any) {
    try {
      await this.index.addDocuments([this.toDocument(listing)]);
    } catch (err) {
      this.logger.warn(`Index listing failed: ${err?.message}`);
    }
  }

  /** Remove a listing from the search index */
  async removeListing(id: string) {
    try {
      await this.index.deleteDocument(id);
    } catch (err) {
      this.logger.warn(`Remove listing failed: ${err?.message}`);
    }
  }

  /** Full-text search with filters, sort, and pagination */
  async search(query: string, options: {
    category?: string; city?: string; minPrice?: number; maxPrice?: number;
    isFeatured?: boolean; sellerVerified?: boolean; sortBy?: string;
    page?: number; limit?: number;
  } = {}) {
    const { page = 1, limit = 20 } = options;

    const filters: string[] = ['status = "active"'];
    if (options.category)       filters.push(`category = "${options.category}"`);
    if (options.city)           filters.push(`location.city = "${options.city}"`);
    if (options.minPrice)       filters.push(`price >= ${options.minPrice}`);
    if (options.maxPrice)       filters.push(`price <= ${options.maxPrice}`);
    if (options.isFeatured)     filters.push('isFeatured = true');
    if (options.sellerVerified) filters.push('seller.isVerified = true');

    const sort: string[] = [];
    if (options.sortBy === 'price_asc')  sort.push('price:asc');
    if (options.sortBy === 'price_desc') sort.push('price:desc');
    if (options.sortBy === 'newest')     sort.push('createdAt:desc');
    if (options.sortBy === 'rating')     sort.push('seller.rating:desc');

    try {
      const result = await this.index.search(query || '', {
        filter: filters.length ? filters.join(' AND ') : undefined,
        sort: sort.length ? sort : undefined,
        offset: (page - 1) * limit,
        limit,
        attributesToHighlight: ['title', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      return {
        items: result.hits,
        meta: {
          total: result.estimatedTotalHits ?? result.hits.length,
          page,
          limit,
          totalPages: Math.ceil((result.estimatedTotalHits ?? result.hits.length) / limit),
          hasNextPage: result.hits.length === limit,
          hasPrevPage: page > 1,
        },
      };
    } catch (err) {
      this.logger.warn(`Search failed: ${err?.message}`);
      return { items: [], meta: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    }
  }

  /** Autocomplete / suggestions as user types */
  async suggest(query: string, limit = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];
    try {
      const result = await this.index.search(query, { limit, attributesToRetrieve: ['title'] });
      return result.hits.map((h: any) => h.title);
    } catch {
      return [];
    }
  }

  private toDocument(listing: any) {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: Number(listing.price),
      currency: listing.currency,
      category: listing.category,
      status: listing.status,
      condition: listing.condition,
      tags: listing.tags ?? [],
      location: listing.location ?? {},
      isFeatured: listing.isFeatured,
      isSponsored: listing.isSponsored,
      views: listing.views,
      createdAt: listing.createdAt ? new Date(listing.createdAt).getTime() / 1000 : 0,
      seller: listing.seller ? {
        id: listing.seller.id,
        firstName: listing.seller.firstName,
        isVerified: listing.seller.isVerified,
        rating: Number(listing.seller.rating),
      } : {},
      store: listing.store ? { name: listing.store.name } : null,
    };
  }
}
