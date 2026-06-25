import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findById(id: string)     { return this.repo.findOne({ where: { id } }); }
  findByPhone(phone: string) { return this.repo.findOne({ where: { phone } }); }
  findByEmail(email: string) { return this.repo.findOne({ where: { email } }); }
  create(data: Partial<User>){ return this.repo.save(this.repo.create(data)); }

  async update(id: string, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async getProfile(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(filters: { query?: string; role?: string; page?: number; limit?: number } = {}) {
    const page  = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip  = (page - 1) * limit;
    const qb    = this.repo.createQueryBuilder('u').skip(skip).take(limit).orderBy('u.joinedAt', 'DESC');
    if (filters.query) qb.where('u.firstName ILIKE :q OR u.lastName ILIKE :q OR u.phone ILIKE :q', { q: `%${filters.query}%` });
    if (filters.role)  qb.andWhere('u.role = :role', { role: filters.role });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } };
  }
}
