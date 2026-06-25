import { Controller, Get, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get own profile' })
  getMe(@CurrentUser() user: User) { return this.svc.getProfile(user.id); }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update own profile' })
  updateMe(@CurrentUser() user: User, @Body() body: Partial<User>) {
    return this.svc.update(user.id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile' })
  getProfile(@Param('id', ParseUUIDPipe) id: string) { return this.svc.getProfile(id); }
}
