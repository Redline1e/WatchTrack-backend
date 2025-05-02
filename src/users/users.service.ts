// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { WatchStatus, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const watchedItems = await this.prisma.watchItem.findMany({
      where: { userId, status: WatchStatus.WATCHED },
      include: { film: { include: { genres: true } } },
    });
    const totalWatched = watchedItems.length;

    const genreCount: Record<string, number> = {};
    watchedItems.forEach((wi) =>
      wi.film.genres.forEach((g) => {
        genreCount[g.name] = (genreCount[g.name] || 0) + 1;
      }),
    );
    const favoriteGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 3);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      totalWatched,
      favoriteGenres,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.getProfile(userId);
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  async deleteProfile(userId: number) {
    await this.getProfile(userId);
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }

  async recommend(userId: number) {
    const watchedItems = await this.prisma.watchItem.findMany({
      where: { userId, status: WatchStatus.WATCHED },
      include: { film: { include: { genres: true } } },
    });
    const genreCount: Record<number, number> = {};
    watchedItems.forEach((wi) =>
      wi.film.genres.forEach((g) => {
        genreCount[g.id] = (genreCount[g.id] || 0) + 1;
      }),
    );
    const topGenreIds = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => Number(id));

    return this.prisma.film.findMany({
      where: { genres: { some: { id: { in: topGenreIds } } } },
      take: 10,
      include: { genres: true },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async updateUserRole(userId: number, newRole: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.$transaction([
      this.prisma.watchItem.deleteMany({ where: { userId } }),
      this.prisma.review.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { message: 'User successfully deleted' };
  }
}
