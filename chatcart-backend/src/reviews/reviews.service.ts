import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private repo: Repository<Review>,
    @InjectRepository(User)   private userRepo: Repository<User>,
  ) {}

  async create(data: { sellerId: string; reviewerId: string; listingId?: string; orderId?: string; rating: number; comment?: string }) {
    const review = await this.repo.save(this.repo.create(data));
    // Recompute seller rating
    const { avg, count } = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.sellerId = :id AND r.isHidden = false', { id: data.sellerId })
      .getRawOne();
    await this.userRepo.update(data.sellerId, { rating: parseFloat(avg) || 0, reviewCount: parseInt(count) || 0 });
    return review;
  }

  async forSeller(sellerId: string, page = 1, limit = 10) {
    const [items, total] = await this.repo.findAndCount({
      where: { sellerId, isHidden: false },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async forListing(listingId: string, page = 1, limit = 10) {
    const [items, total] = await this.repo.findAndCount({
      where: { listingId, isHidden: false },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }

  async reply(id: string, reply: string) {
    await this.repo.update(id, { reply, repliedAt: new Date() });
    return this.repo.findOne({ where: { id } });
  }
}
