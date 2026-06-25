import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappLead } from './entities/whatsapp-lead.entity';
import { Listing } from '../listings/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappLead, Listing])],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
