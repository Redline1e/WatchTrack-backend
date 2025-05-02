import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<Role[]>('roles', ctx.getHandler());
    if (!required) return true;
    const user = ctx.switchToHttp().getRequest().user;
    if (!required.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
