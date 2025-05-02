// src/watch-items/watch-items.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WatchItemsService } from './watch-items.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchItemDto } from './dto/create-watch-item.dto';
import { WatchStatus } from '@prisma/client';

describe('WatchItemsService', () => {
  let service: WatchItemsService;
  const prismaMock = {
    film: { findUnique: jest.fn() },
    watchItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchItemsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(WatchItemsService);
  });

  describe('add()', () => {
    it('throws if film not found', async () => {
      prismaMock.film.findUnique.mockResolvedValue(null);
      await expect(
        service.add(1, {
          filmId: 5,
          status: WatchStatus.PLANNED,
        } as CreateWatchItemDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates and maps item', async () => {
      prismaMock.film.findUnique.mockResolvedValue({ id: 5 });
      const raw = {
        id: 7,
        status: WatchStatus.WATCHED,
        addedAt: new Date(),
        watchedAt: new Date(),
        film: {
          id: 5,
          title: 'T',
          description: null,
          releaseYear: 2021,
          type: 'MOVIE',
          genres: [],
          reviews: [],
        },
      };
      prismaMock.watchItem.create.mockResolvedValue(raw);
      const res = await service.add(1, {
        filmId: 5,
        status: WatchStatus.WATCHED,
      } as CreateWatchItemDto);
      expect(res.film.id).toBe(5);
      expect(res.id).toBe(7);
    });
  });

  describe('findAll()', () => {
    it('returns mapped items for user', async () => {
      const raws = [
        {
          id: 8,
          status: WatchStatus.PLANNED,
          addedAt: new Date(),
          watchedAt: null,
          film: {
            id: 6,
            title: 'X',
            description: null,
            releaseYear: 2022,
            type: 'SERIES',
            genres: [],
            reviews: [],
          },
        },
      ];
      prismaMock.watchItem.findMany.mockResolvedValue(raws);
      const res = await service.findAll(2);
      expect(prismaMock.watchItem.findMany).toHaveBeenCalledWith({
        where: { userId: 2 },
        include: { film: { include: { genres: true, reviews: true } } },
        orderBy: { addedAt: 'desc' },
      });
      expect(res[0].film.id).toBe(6);
    });
  });

  describe('update()', () => {
    it('throws if not found or wrong user', async () => {
      prismaMock.watchItem.findUnique.mockResolvedValue({ id: 9, userId: 5 });
      await expect(service.update(9, 7, WatchStatus.WATCHED)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates and maps', async () => {
      prismaMock.watchItem.findUnique.mockResolvedValue({ id: 9, userId: 7 });
      const raw = {
        id: 9,
        status: WatchStatus.WATCHED,
        addedAt: new Date(),
        watchedAt: null,
        film: {
          id: 6,
          title: 'X',
          description: null,
          releaseYear: 2022,
          type: 'SERIES',
          genres: [],
          reviews: [],
        },
      };
      prismaMock.watchItem.update.mockResolvedValue(raw);
      const res = await service.update(9, 7, WatchStatus.WATCHED);
      expect(prismaMock.watchItem.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: { status: WatchStatus.WATCHED },
        include: { film: { include: { genres: true, reviews: true } } },
      });
      expect(res.id).toBe(9);
    });
  });
});
