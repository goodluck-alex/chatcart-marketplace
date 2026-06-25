import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Listing } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(listingId: string, buyer: User, paymentMethod: string, notes?: string) {
    const listing = await this.listingRepo.findOne({ where: { id: listingId }, relations: ['seller'] });
    if (!listing) throw new NotFoundException('Listing not found');
    const order = this.repo.create({
      listingId, buyerId: buyer.id, sellerId: listing.sellerId,
      totalAmount: listing.price, currency: listing.currency,
      paymentMethod, notes,
    });
    return this.repo.save(order);
  }

  async findById(id: string) {
    const order = await this.repo.findOne({ where: { id }, relations: ['listing', 'buyer', 'seller'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.repo.update(id, {
      status,
      ...(status === OrderStatus.COMPLETED ? { completedAt: new Date() } : {}),
    });
    return this.findById(id);
  }

  async getBuyerOrders(buyerId: string, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { buyerId },
      relations: ['listing', 'seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { sellerId },
      relations: ['listing', 'buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async getAllAdmin(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['listing', 'buyer', 'seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }
}
