import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_images')
export class ListingImage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() listingId: string;
  @ManyToOne(() => Listing, l => l.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
  @Column() url: string;
  @Column() thumbnailUrl: string;
  @Column({ nullable: true }) cdnKey: string;
  @Column({ nullable: true }) altText: string;
  @Column({ default: 0 }) sortOrder: number;
  @Column({ default: false }) isPrimary: boolean;
  @CreateDateColumn() createdAt: Date;
}
