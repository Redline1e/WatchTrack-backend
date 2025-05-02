import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { PrismaService } from '../prisma/prisma.service';
import { FilmType } from '@prisma/client';
import { Multer } from 'multer';

describe('FilmsService', () => {
  let service: FilmsService;
  const prismaMock = {
    film: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return mapped films with average rating', async () => {
      const filmData = [
        {
          id: 1,
          title: 'A',
          description: null,
          releaseYear: 2000,
          type: FilmType.MOVIE,
          genres: [],
          reviews: [{ rating: 8 }, { rating: 6 }],
          photoUrl: null,
        },
        {
          id: 2,
          title: 'B',
          description: 'Desc',
          releaseYear: 2020,
          type: FilmType.SERIES,
          genres: [{ id: 1, name: 'G' }],
          reviews: [],
          photoUrl: '/img',
        },
      ];
      prismaMock.film.findMany.mockResolvedValue(filmData);

      const result = await service.findAll();

      expect(prismaMock.film.findMany).toHaveBeenCalledWith({
        include: { genres: true, reviews: true },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([
        {
          id: 1,
          title: 'A',
          description: null,
          releaseYear: 2000,
          type: FilmType.MOVIE,
          genres: [],
          ratingAvg: 7.0,
          photoUrl: null,
        },
        {
          id: 2,
          title: 'B',
          description: 'Desc',
          releaseYear: 2020,
          type: FilmType.SERIES,
          genres: [{ id: 1, name: 'G' }],
          ratingAvg: 0,
          photoUrl: '/img',
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if film not found', async () => {
      prismaMock.film.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return mapped film when found', async () => {
      const film = {
        id: 1,
        title: 'A',
        description: null,
        releaseYear: 2001,
        type: FilmType.ANIME,
        genres: [],
        reviews: [{ rating: 5 }],
        photoUrl: null,
      };
      prismaMock.film.findUnique.mockResolvedValue(film);

      const result = await service.findOne(1);
      expect(prismaMock.film.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { genres: true, reviews: true },
      });
      expect(result.ratingAvg).toBe(5.0);
      expect(result.id).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a film with connected genres', async () => {
      const dto = {
        title: 'New',
        type: FilmType.MOVIE,
        genres: [1, 2],
        description: undefined,
        releaseYear: undefined,
      };
      const created = { id: 1, ...dto };
      prismaMock.film.create.mockResolvedValue(created);

      const result = await service.create(dto as any);
      expect(prismaMock.film.create).toHaveBeenCalledWith({
        data: {
          title: 'New',
          description: undefined,
          releaseYear: undefined,
          type: FilmType.MOVIE,
          genres: { connect: [{ id: 1 }, { id: 2 }] },
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update a film and set genres', async () => {
      const dto = {
        title: 'Upd',
        type: FilmType.SERIES,
        genres: [3],
        description: 'd',
        releaseYear: 1999,
      };
      const updated = { id: 2, ...dto };
      prismaMock.film.update.mockResolvedValue(updated);

      const result = await service.update(2, dto as any);
      expect(prismaMock.film.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          title: 'Upd',
          description: 'd',
          releaseYear: 1999,
          type: FilmType.SERIES,
          genres: { set: [{ id: 3 }] },
        },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete the film', async () => {
      prismaMock.film.delete.mockResolvedValue({ id: 3 });
      const result = await service.remove(3);
      expect(prismaMock.film.delete).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(result).toEqual({ id: 3 });
    });
  });

  describe('savePhoto', () => {
    it('should update film with photoUrl', async () => {
      const file = { filename: 'img.jpg' } as Multer.File;
      prismaMock.film.update.mockResolvedValue({
        id: 4,
        photoUrl: '/uploads/img.jpg',
      });

      const result = await service.savePhoto(4, file);
      expect(prismaMock.film.update).toHaveBeenCalledWith({
        where: { id: 4 },
        data: { photoUrl: '/uploads/img.jpg' },
      });
      expect(result.photoUrl).toBe('/uploads/img.jpg');
    });
  });
});
