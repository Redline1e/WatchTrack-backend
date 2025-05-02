import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { UpdateProfileDto } from './dto/profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getProfile(@Param('id') id: number, @User('userId') userId: number) {
    if (userId !== id) throw new UnauthorizedException();
    return this.usersService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateProfile(
    @Param('id') id: number,
    @User('userId') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    if (userId !== id) throw new UnauthorizedException();
    return this.usersService.updateProfile(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteProfile(@Param('id') id: number, @User('userId') userId: number) {
    if (userId !== id) throw new UnauthorizedException();
    return this.usersService.deleteProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/recommendations')
  getRecommendations(@Param('id') id: number, @User('userId') userId: number) {
    if (userId !== id) throw new UnauthorizedException();
    return this.usersService.recommend(id);
  }
}
