import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private repo: Repository<Store>,
    @InjectRepository(User)  private userRepo: Repository<User>,
  ) {}

  async create(userId: string, data: Partial<Store>): Promise<Store> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) throw new ConflictException('You already have a store');

    const slug = this.makeSlug(data.name + '-' + Date.now());
    const store = await this.repo.save(this.repo.create({ ...data, userId, slug }));

    // Upgrade user role to seller/business
    await this.userRepo.update(userId, { role: 'business' as any });
    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.repo.findOne({ where: { slug }, relations: ['user'] });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async findByUser(userId: string): Promise<Store | null> {
    return this.repo.findOne({ where: { userId }, relations: ['user'] });
  }

  async findById(id: string): Promise<Store> {
    const store = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async update(userId: string, data: Partial<Store>): Promise<Store> {
    const store = await this.repo.findOne({ where: { userId } });
    if (!store) throw new NotFoundException('Store not found');
    await this.repo.update(store.id, data);
    return this.findById(store.id);
  }

  async getAll(page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      relations: ['user'],
      order: { isFeatured: 'DESC', followersCount: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async getAnalytics(storeId: string) {
    const store = await this.findById(storeId);
    return {
      totalListings: store.totalListings,
      totalSales: store.totalSales,
      followers: store.followersCount,
      rating: store.rating,
      reviewCount: store.reviewCount,
    };
  }

  private makeSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
