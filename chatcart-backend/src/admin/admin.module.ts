import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Store } from '../stores/entities/store.entity';
import { Review } from '../reviews/entities/review.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Listing, Order, Payment, Store, Review, Notification]),
    SearchModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
