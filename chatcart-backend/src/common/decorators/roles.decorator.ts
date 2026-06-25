import { SetMetadata } from '@nestjs/common';

export type UserRole = 'buyer' | 'seller' | 'business' | 'admin' | 'superadmin';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
