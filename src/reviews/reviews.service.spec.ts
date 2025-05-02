// src/reviews/reviews.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  const prismaMock = {
    film: { findUnique: jest.fn() },
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(ReviewsService);
  });

  describe('create()', () => {
    it('throws if film not found', async () => {
      prismaMock.film.findUnique.mockResolvedValue(null);
      await expect(
        service.create(1, {
          filmId: 10,
          rating: 5,
          comment: 'x',
        } as CreateReviewDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates review when film exists', async () => {
      prismaMock.film.findUnique.mockResolvedValue({ id: 10 });
      const dto: CreateReviewDto = { filmId: 10, rating: 8, comment: 'nice' };
      prismaMock.review.create.mockResolvedValue({ id: 2, userId: 1, ...dto });
      const result = await service.create(1, dto);
      expect(prismaMock.review.create).toHaveBeenCalledWith({
        data: { userId: 1, ...dto },
      });
      expect(result).toMatchObject({ id: 2, rating: 8 });
    });
  });

  describe('findAll()', () => {
    it('returns all reviews with include', async () => {
      prismaMock.review.findMany.mockResolvedValue([{ id: 1, rating: 5 }]);
      const res = await service.findAll();
      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        include: {
          user: { select: { id: true, name: true } },
          film: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(res).toEqual([{ id: 1, rating: 5 }]);
    });
  });

  describe('findByFilm()', () => {
    it('filters by filmId', async () => {
      prismaMock.review.findMany.mockResolvedValue([{ id: 3, rating: 7 }]);
      const res = await service.findByFilm(42);
      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        where: { filmId: 42 },
        include: {
          user: { select: { id: true, name: true } },
          film: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(res).toEqual([{ id: 3, rating: 7 }]);
    });
  });

  describe('findByUser()', () => {
    it('filters by userId', async () => {
      prismaMock.review.findMany.mockResolvedValue([{ id: 4, rating: 9 }]);
      const res = await service.findByUser(99);
      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        where: { userId: 99 },
        include: {
          user: { select: { id: true, name: true } },
          film: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(res).toEqual([{ id: 4, rating: 9 }]);
    });
  });

  describe('update()', () => {
    it('throws if not found', async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);
      await expect(
        service.update(5, { rating: 3 } as UpdateReviewDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates when found', async () => {
      prismaMock.review.findUnique.mockResolvedValue({ id: 5 });
      const dto: UpdateReviewDto = { rating: 4, comment: 'ok' };
      prismaMock.review.update.mockResolvedValue({ id: 5, ...dto });
      const res = await service.update(5, dto);
      expect(prismaMock.review.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: dto,
      });
      expect(res).toMatchObject({ id: 5, rating: 4 });
    });
  });

  describe('remove()', () => {
    it('throws if not found', async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);
      await expect(service.remove(6)).rejects.toThrow(NotFoundException);
    });

    it('deletes and returns deleted:true', async () => {
      prismaMock.review.findUnique.mockResolvedValue({ id: 6 });
      prismaMock.review.delete.mockResolvedValue({ id: 6 });
      const res = await service.remove(6);
      expect(prismaMock.review.delete).toHaveBeenCalledWith({
        where: { id: 6 },
      });
      expect(res).toEqual({ deleted: true });
    });
  });
});
