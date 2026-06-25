import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Store } from '../stores/entities/store.entity';
import { SearchService } from '../search/search.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)    private userRepo: Repository<User>,
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
    @InjectRepository(Order)   private orderRepo: Repository<Order>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Store)   private storeRepo: Repository<Store>,
    private searchSvc: SearchService,
  ) {}

  // ─── Platform Stats ────────────────────────────────────────────────────────
  async getStats() {
    const [totalUsers, totalListings, activeListings, totalOrders, pendingListings] =
      await Promise.all([
        this.userRepo.count(),
        this.listingRepo.count(),
        this.listingRepo.count({ where: { status: ListingStatus.ACTIVE } }),
        this.orderRepo.count(),
        this.listingRepo.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
      ]);

    const revenueResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where("p.status = 'completed'")
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total ?? '0');

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const [newUsersToday, newListingsToday, ordersToday] = await Promise.all([
      this.userRepo.createQueryBuilder('u').where('u.joinedAt >= :d', { d: todayStart }).getCount(),
      this.listingRepo.createQueryBuilder('l').where('l.createdAt >= :d', { d: todayStart }).getCount(),
      this.orderRepo.createQueryBuilder('o').where('o.createdAt >= :d', { d: todayStart }).getCount(),
    ]);

    const revTodayRes = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where("p.status = 'completed' AND p.createdAt >= :d", { d: todayStart })
      .getRawOne();

    return {
      totalUsers,
      totalSellers: await this.userRepo.count({ where: { role: 'seller' as any } }),
      totalListings,
      activeListings,
      pendingListings,
      totalOrders,
      totalRevenue,
      newUsersToday,
      newListingsToday,
      ordersToday,
      revenueToday: parseFloat(revTodayRes?.total ?? '0'),
      conversionRate: totalListings > 0 ? Math.round((totalOrders / totalListings) * 100 * 10) / 10 : 0,
    };
  }

  // ─── Revenue chart (last N days) ──────────────────────────────────────────
  async getRevenueChart(days = 30) {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const day   = new Date(); day.setDate(day.getDate() - i); day.setHours(0, 0, 0, 0);
      const next  = new Date(day); next.setDate(next.getDate() + 1);

      const [ordersCount, revResult] = await Promise.all([
        this.orderRepo.createQueryBuilder('o').where('o.createdAt >= :s AND o.createdAt < :e', { s: day, e: next }).getCount(),
        this.paymentRepo.createQueryBuilder('p')
          .select('SUM(p.amount)', 'total')
          .where("p.status = 'completed' AND p.createdAt >= :s AND p.createdAt < :e", { s: day, e: next })
          .getRawOne(),
      ]);

      data.push({
        date: day.toISOString().split('T')[0],
        revenue: parseFloat(revResult?.total ?? '0'),
        orders: ordersCount,
      });
    }
    return data;
  }

  // ─── Category breakdown ────────────────────────────────────────────────────
  async getCategoryBreakdown() {
    const result = await this.listingRepo
      .createQueryBuilder('l')
      .select('l.category', 'category')
      .addSelect('COUNT(l.id)', 'count')
      .where("l.status = 'active'")
      .groupBy('l.category')
      .orderBy('count', 'DESC')
      .getRawMany();

    const total = result.reduce((s: number, r: any) => s + parseInt(r.count), 0);
    return result.map((r: any) => ({
      category: r.category,
      count: parseInt(r.count),
      percentage: total > 0 ? Math.round((parseInt(r.count) / total) * 100 * 10) / 10 : 0,
    }));
  }

  // ─── Users ────────────────────────────────────────────────────────────────
  async getUsers(filters: { query?: string; role?: string; isBanned?: boolean; page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1; const limit = filters.limit ?? 20;
    const qb = this.userRepo.createQueryBuilder('u').skip((page - 1) * limit).take(limit).orderBy('u.joinedAt', 'DESC');
    if (filters.query) qb.where('(u.firstName ILIKE :q OR u.lastName ILIKE :q OR u.phone ILIKE :q OR u.email ILIKE :q)', { q: `%${filters.query}%` });
    if (filters.role)     qb.andWhere('u.role = :role', { role: filters.role });
    if (filters.isBanned !== undefined) qb.andWhere('u.isBanned = :b', { b: filters.isBanned });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async banUser(id: string, reason: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, { isBanned: true, isActive: false, bannedReason: reason });
  }

  async unbanUser(id: string) {
    await this.userRepo.update(id, { isBanned: false, isActive: true, bannedReason: '' });
  }

  async verifyUser(id: string) {
    await this.userRepo.update(id, { isVerified: true, verificationStatus: 'verified' as any });
  }

  async updateUser(id: string, data: Partial<User>) {
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  // ─── Listings ─────────────────────────────────────────────────────────────
  async getListings(filters: { category?: string; status?: string; query?: string; page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1; const limit = filters.limit ?? 20;
    const qb = this.listingRepo.createQueryBuilder('l').leftJoinAndSelect('l.seller', 'seller').leftJoinAndSelect('l.images', 'images').skip((page - 1) * limit).take(limit).orderBy('l.createdAt', 'DESC');
    if (filters.category && filters.category !== 'all') qb.where('l.category = :cat', { cat: filters.category });
    if (filters.status   && filters.status   !== 'all') qb.andWhere('l.status = :st', { st: filters.status });
    if (filters.query) qb.andWhere('l.title ILIKE :q', { q: `%${filters.query}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async approveListing(id: string) {
    await this.listingRepo.update(id, { status: ListingStatus.ACTIVE, isFeatured: false });
    const listing = await this.listingRepo.findOne({ where: { id }, relations: ['seller', 'images'] });
    if (listing) await this.searchSvc.indexListing(listing);
    return listing;
  }

  async rejectListing(id: string, reason: string) {
    await this.listingRepo.update(id, { status: ListingStatus.SUSPENDED });
    await this.searchSvc.removeListing(id);
    return { id, reason };
  }

  async suspendListing(id: string, reason: string) {
    await this.listingRepo.update(id, { status: ListingStatus.SUSPENDED });
    await this.searchSvc.removeListing(id);
    return { id, reason };
  }

  async featureListing(id: string, days: number) {
    const until = new Date(); until.setDate(until.getDate() + days);
    await this.listingRepo.update(id, { isFeatured: true, featuredUntil: until });
    return { id, featuredUntil: until };
  }

  async deleteListing(id: string) {
    await this.listingRepo.delete(id);
    await this.searchSvc.removeListing(id);
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  async getOrders(filters: { status?: string; page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1; const limit = filters.limit ?? 20;
    const qb   = this.orderRepo.createQueryBuilder('o').leftJoinAndSelect('o.buyer', 'buyer').leftJoinAndSelect('o.seller', 'seller').leftJoinAndSelect('o.listing', 'listing').skip((page - 1) * limit).take(limit).orderBy('o.createdAt', 'DESC');
    if (filters.status && filters.status !== 'all') qb.where('o.status = :s', { s: filters.status });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  // ─── Stores ───────────────────────────────────────────────────────────────
  async getStores(page = 1, limit = 20) {
    const [items, total] = await this.storeRepo.findAndCount({
      relations: ['user'], order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async verifyStore(id: string) {
    await this.storeRepo.update(id, { isVerified: true });
    return this.storeRepo.findOne({ where: { id } });
  }
}
