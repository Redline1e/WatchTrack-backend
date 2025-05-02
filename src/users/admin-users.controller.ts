// admin-users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { Role } from '@prisma/client';

@Controller('admin/users')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@User('role') role: Role) {
    if (role !== Role.ADMIN)
      throw new ForbiddenException('Available only to administrators');
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') newRole: Role,
    @User('role') role: Role,
  ) {
    if (role !== Role.ADMIN)
      throw new ForbiddenException('Available only to administrators');
    return this.usersService.updateUserRole(parseInt(id), newRole);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @User('role') role: Role) {
    if (role !== Role.ADMIN)
      throw new ForbiddenException('Available only to administrators');
    return this.usersService.deleteUser(parseInt(id));
  }
}
