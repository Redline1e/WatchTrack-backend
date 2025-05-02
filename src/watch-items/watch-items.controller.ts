import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WatchItemsService, WatchItemResponse } from './watch-items.service';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WatchStatus } from '@prisma/client';
import { User } from '../auth/user.decorator';

@Controller('watch-items') 
@UseGuards(JwtAuthGuard)
export class WatchItemsController {
  constructor(private readonly svc: WatchItemsService) {}

  @Post()
  async add(
    @User('userId') userId: number,
    @Body() dto: CreateWatchItemDto,
  ): Promise<WatchItemResponse> {
    return this.svc.add(userId, dto);
  }

  @Get()
  async findAll(@User('userId') userId: number): Promise<WatchItemResponse[]> {
    return this.svc.findAll(userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @User('userId') userId: number,
    @Body('status') status: WatchStatus,
  ): Promise<WatchItemResponse> {
    return this.svc.update(+id, userId, status);
  }
}
