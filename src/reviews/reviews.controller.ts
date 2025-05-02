import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../auth/user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User('userId') userId: number, @Body() dto: CreateReviewDto) {
    return this.svc.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('film/:id')
  findByFilm(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findByFilm(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  findByUser(@User('userId') userId: number) {
    return this.svc.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
