import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GenresService', () => {
  let service: GenresService;
  const prismaMock = {
    genre: {
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
        GenresService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<GenresService>(GenresService);
    jest.clearAllMocks();
  });

  it('findAll should return array of genres', async () => {
    prismaMock.genre.findMany.mockResolvedValue([{ id: 1, name: 'G' }]);
    const result = await service.findAll();
    expect(prismaMock.genre.findMany).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: 'G' }]);
  });

  it('findOne throws if not found', async () => {
    prismaMock.genre.findUnique.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('findOne returns genre if exists', async () => {
    prismaMock.genre.findUnique.mockResolvedValue({ id: 2, name: 'X' });
    const g = await service.findOne(2);
    expect(g.name).toBe('X');
  });

  it('create should create genre', async () => {
    prismaMock.genre.create.mockResolvedValue({ id: 3, name: 'New' });
    const g = await service.create({ name: 'New' });
    expect(prismaMock.genre.create).toHaveBeenCalledWith({
      data: { name: 'New' },
    });
    expect(g.id).toBe(3);
  });

  it('update should update genre', async () => {
    prismaMock.genre.update.mockResolvedValue({ id: 4, name: 'Up' });
    const g = await service.update(4, { name: 'Up' });
    expect(prismaMock.genre.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { name: 'Up' },
    });
    expect(g.name).toBe('Up');
  });

  it('remove should delete genre', async () => {
    prismaMock.genre.delete.mockResolvedValue({ id: 5, name: 'D' });
    const g = await service.remove(5);
    expect(prismaMock.genre.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(g.id).toBe(5);
  });
});
