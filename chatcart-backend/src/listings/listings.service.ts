import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing, ListingStatus } from './entities/listing.entity';
import { ListingImage } from './entities/listing-image.entity';
import { User } from '../users/entities/user.entity';
import { detectLocation, evaluateListingQuality, generatePromotions, resolveCurrency, scoreListingForDiscovery, suggestListingDraft } from './listing-intelligence';

export interface ListingFilters {
  category?: string; query?: string; city?: string; country?: string;
  minPrice?: number; maxPrice?: number; sellerVerified?: boolean;
  isFeatured?: boolean; status?: string; sellerId?: string;
  sortBy?: string; page?: number; limit?: number;
  lat?: number; lng?: number; radiusKm?: number;
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
    @InjectRepository(ListingImage) private imageRepo: Repository<ListingImage>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(filters: ListingFilters = {}) {
    const page  = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip  = (page - 1) * limit;

    const qb = this.listingRepo.createQueryBuilder('l')
      .leftJoinAndSelect('l.seller', 'seller')
      .leftJoinAndSelect('l.images', 'images')
      .where('l.status = :status', { status: filters.status ?? ListingStatus.ACTIVE });

    if (filters.category)   qb.andWhere('l.category = :cat', { cat: filters.category });
    if (filters.city)       qb.andWhere("l.location->>'city' ILIKE :city", { city: `%${filters.city}%` });
    if (filters.minPrice)   qb.andWhere('l.price >= :min', { min: filters.minPrice });
    if (filters.maxPrice)   qb.andWhere('l.price <= :max', { max: filters.maxPrice });
    if (filters.isFeatured) qb.andWhere('l.isFeatured = true');
    if (filters.sellerId)   qb.andWhere('l.sellerId = :sid', { sid: filters.sellerId });
    if (filters.sellerVerified) qb.andWhere('seller.isVerified = true');
    if (filters.query) {
      qb.andWhere('(l.title ILIKE :q OR l.description ILIKE :q OR l.location->>city ILIKE :q)', { q: `%${filters.query}%` });
    }

    switch (filters.sortBy) {
      case 'price_asc':  qb.orderBy('l.price', 'ASC'); break;
      case 'price_desc': qb.orderBy('l.price', 'DESC'); break;
      case 'newest':     qb.orderBy('l.createdAt', 'DESC'); break;
      case 'rating':     qb.orderBy('seller.rating', 'DESC'); break;
      default:           qb.orderBy('l.views', 'DESC').addOrderBy('l.isFeatured', 'DESC').addOrderBy('l.createdAt', 'DESC');
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const normalized = items
      .map(item => ({ ...item, location: item.location || {}, currency: item.currency || resolveCurrency((item.location as any)?.country) }))
      .sort((a, b) => scoreListingForDiscovery(b as any) - scoreListingForDiscovery(a as any));
    return { items: normalized, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async findById(id: string) {
    const listing = await this.listingRepo.findOne({
      where: { id },
      relations: ['seller', 'images'],
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async getFeatured(limit = 8) {
    return this.listingRepo.find({
      where: { status: ListingStatus.ACTIVE, isFeatured: true },
      relations: ['seller', 'images'],
      order: { views: 'DESC' },
      take: limit,
    });
  }

  async create(data: Partial<Listing>, seller: User) {
    const normalizedLocation = detectLocation((data.location as any) || {});
    const currency = resolveCurrency(normalizedLocation.country);
    const suggestion = suggestListingDraft({
      title: data.title as string,
      description: data.description as string,
      category: data.category as string,
      imageCount: Array.isArray((data as any).images) ? (data as any).images.length : 0,
      location: normalizedLocation,
      sellerCountry: seller.country,
    });
    const quality = evaluateListingQuality(data.title as string, data.description as string, []);
    const promotions = generatePromotions({
      title: suggestion.title,
      description: suggestion.description,
      city: normalizedLocation.city,
      currency,
      price: Number(data.price),
    });
    const slug = this.makeSlug((data.title || suggestion.title) + '-' + Date.now());
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const listing = this.listingRepo.create({
      ...data,
      title: data.title || suggestion.title,
      description: data.description || suggestion.description,
      category: data.category || suggestion.category,
      currency: (data.currency as any) || currency,
      location: {
        ...normalizedLocation,
        ...(data.location || {}),
      },
      tags: data.tags || suggestion.tags,
      sellerId: seller.id,
      slug,
      status: ListingStatus.ACTIVE,
      expiresAt,
      isFeatured: true,
      isSponsored: quality.duplicate || quality.spam ? false : true,
      attributes: {
        ...(data.attributes || {}),
        aiSuggestedCategory: suggestion.category,
        aiSuggestedBrand: suggestion.brand || '',
        aiPromotions: promotions,
        qualityCheck: quality,
      },
    });
    const saved = await this.listingRepo.save(listing);
    await this.userRepo.increment({ id: seller.id }, 'totalListings', 1);
    return this.findById(saved.id);
  }

  async update(id: string, data: Partial<Listing>, userId: string) {
    const listing = await this.findById(id);
    if (listing.sellerId !== userId) throw new ForbiddenException('Cannot edit another seller\'s listing');
    const normalizedLocation = detectLocation((data.location as any) || (listing.location as any) || {});
    const currency = resolveCurrency(normalizedLocation.country);
    const suggestion = suggestListingDraft({
      title: data.title as string || listing.title,
      description: data.description as string || listing.description,
      category: data.category as string || listing.category,
      imageCount: Array.isArray((data as any).images) ? (data as any).images.length : listing.images?.length || 0,
      location: normalizedLocation,
      sellerCountry: listing.seller?.country,
    });
    const quality = evaluateListingQuality(data.title as string || listing.title, data.description as string || listing.description, [listing.title]);
    const updatePayload: any = {
      ...data,
      title: data.title || listing.title,
      description: data.description || listing.description,
      category: data.category || listing.category,
      currency: (data.currency as any) || currency,
      location: {
        ...normalizedLocation,
        ...(data.location || listing.location || {}),
      },
      tags: data.tags || suggestion.tags,
      attributes: {
        ...(listing.attributes || {}),
        ...(data.attributes || {}),
        aiSuggestedCategory: suggestion.category,
        aiSuggestedBrand: suggestion.brand || '',
        qualityCheck: quality,
      },
    };
    await this.listingRepo.update(id, updatePayload);
    return this.findById(id);
  }

  async remove(id: string, userId: string) {
    const listing = await this.findById(id);
    if (listing.sellerId !== userId) throw new ForbiddenException('Cannot delete another seller\'s listing');
    await this.listingRepo.softDelete(id);
  }

  async incrementView(id: string) {
    await this.listingRepo.increment({ id }, 'views', 1);
  }

  async getNearby(lat: number, lng: number, radiusKm = 20, limit = 12) {
    const qb = this.listingRepo.createQueryBuilder('l')
      .leftJoinAndSelect('l.seller', 'seller')
      .leftJoinAndSelect('l.images', 'images')
      .where('l.status = :status', { status: ListingStatus.ACTIVE })
      .orderBy('l.createdAt', 'DESC')
      .take(limit * 2);
    const items = await qb.getMany();
    return items
      .map(item => ({ ...item, score: scoreListingForDiscovery(item as any) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getRecommendations(userId?: string, filters: ListingFilters = {}, limit = 6) {
    const qb = this.listingRepo.createQueryBuilder('l')
      .leftJoinAndSelect('l.seller', 'seller')
      .leftJoinAndSelect('l.images', 'images')
      .where('l.status = :status', { status: filters.status ?? ListingStatus.ACTIVE });

    if (filters.category) qb.andWhere('l.category = :cat', { cat: filters.category });
    if (filters.city) qb.andWhere("l.location->>'city' ILIKE :city", { city: `%${filters.city}%` });
    if (filters.query) qb.andWhere('(l.title ILIKE :q OR l.description ILIKE :q)', { q: `%${filters.query}%` });

    const items = await qb.orderBy('l.createdAt', 'DESC').take(limit * 2).getMany();
    return items
      .map(item => ({ ...item, score: scoreListingForDiscovery(item as any) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async trackWhatsAppClick(id: string) {
    await this.listingRepo.increment({ id }, 'whatsappLeads', 1);
  }

  async getMyListings(userId: string, filters: ListingFilters = {}) {
    return this.findAll({ ...filters, sellerId: userId, status: filters.status ?? undefined });
  }

  private makeSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
