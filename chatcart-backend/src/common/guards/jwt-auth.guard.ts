import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException('Invalid or expired token');
    if (user.isBanned) throw new UnauthorizedException('Account has been suspended');
    return user;
  }
}
