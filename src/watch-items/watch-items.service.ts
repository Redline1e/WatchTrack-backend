import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { WatchStatus } from '@prisma/client';

export type WatchItemResponse = {
  id: number;
  status: WatchStatus;
  addedAt: Date;
  watchedAt: Date | null;
  film: {
    id: number;
    title: string;
    description: string | null;
    releaseYear: number | null;
    type: string;
    genres: { id: number; name: string }[];
    ratingAvg: number;
    photoUrl: string | null;
  };
};

@Injectable()
export class WatchItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async add(
    userId: number,
    dto: CreateWatchItemDto,
  ): Promise<WatchItemResponse> {
    const film = await this.prisma.film.findUnique({
      where: { id: dto.filmId },
    });
    if (!film) throw new NotFoundException('Film not found');

    const item = await this.prisma.watchItem.create({
      data: {
        userId,
        filmId: dto.filmId,
        status: dto.status,
      },
      include: { film: { include: { genres: true, reviews: true } } },
    });

    return this.mapItem(item);
  }

  async findAll(userId: number): Promise<WatchItemResponse[]> {
    const items = await this.prisma.watchItem.findMany({
      where: { userId },
      include: { film: { include: { genres: true, reviews: true } } },
      orderBy: { addedAt: 'desc' },
    });
    return items.map((i) => this.mapItem(i));
  }

  async update(
    id: number,
    userId: number,
    status: WatchStatus,
  ): Promise<WatchItemResponse> {
    const existing = await this.prisma.watchItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      throw new NotFoundException('Item not found');

    const item = await this.prisma.watchItem.update({
      where: { id },
      data: { status },
      include: { film: { include: { genres: true, reviews: true } } },
    });
    return this.mapItem(item);
  }

  private mapItem(item: any): WatchItemResponse {
    const f = item.film;
    const sum = f.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const avg = f.reviews.length ? sum / f.reviews.length : 0;
    return {
      id: item.id,
      status: item.status,
      addedAt: item.addedAt,
      watchedAt: item.watchedAt,
      film: {
        id: f.id,
        title: f.title,
        description: f.description,
        releaseYear: f.releaseYear,
        type: f.type,
        genres: f.genres,
        ratingAvg: parseFloat(avg.toFixed(1)),
        photoUrl: f.photoUrl,
      },
    };
  }
}
