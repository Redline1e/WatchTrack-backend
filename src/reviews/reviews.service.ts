// src/reviews/reviews.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateReviewDto) {
    const film = await this.prisma.film.findUnique({
      where: { id: dto.filmId },
    });
    if (!film) throw new NotFoundException('Film not found');
    return this.prisma.review.create({ data: { userId, ...dto } });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: {
          select: { id: true, name: true },
        },
        film: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFilm(filmId: number) {
    return this.prisma.review.findMany({
      where: { filmId },
      include: {
        user: {
          select: { id: true, name: true },
        },
        film: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true },
        },
        film: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateReviewDto) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Review not found');
    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}
