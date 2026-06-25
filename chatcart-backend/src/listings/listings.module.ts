import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { Listing } from './entities/listing.entity';
import { ListingImage } from './entities/listing-image.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, ListingImage, User])],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
