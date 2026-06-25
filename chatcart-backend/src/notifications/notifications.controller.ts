import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  getAll(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getForUser(user.id, +page, +limit);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id') id: string) { return this.svc.markRead(id); }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: User) { return this.svc.markAllRead(user.id); }
}
