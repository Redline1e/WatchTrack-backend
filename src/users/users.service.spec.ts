// src/users/users.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { Role, WatchStatus } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    watchItem: { findMany: jest.fn(), deleteMany: jest.fn() },
    review: { deleteMany: jest.fn() },
    film: { findMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  describe('getProfile()', () => {
    it('throws if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile(1)).rejects.toThrow(NotFoundException);
    });

    it('returns profile with favoriteGenres', async () => {
      const user = { id: 1, email: 'e', name: 'n', createdAt: new Date() };
      const items = [
        { film: { genres: [{ name: 'A' }, { name: 'B' }] } },
        { film: { genres: [{ name: 'A' }] } },
      ];
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.watchItem.findMany.mockResolvedValue(items);
      const res = await service.getProfile(1);
      expect(res).toMatchObject({
        id: 1,
        email: 'e',
        totalWatched: 2,
        favoriteGenres: ['A', 'B'],
      });
    });
  });

  describe('updateProfile()', () => {
    it('calls getProfile then update', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
      prismaMock.watchItem.findMany.mockResolvedValue([]);
      const dto: UpdateProfileDto = { name: 'New' };
      prismaMock.user.update.mockResolvedValue({ id: 2, ...dto });
      const res = await service.updateProfile(2, dto);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: dto,
      });
      expect(res.name).toBe('New');
    });
  });

  describe('deleteProfile()', () => {
    it('calls getProfile then deletes user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 3 });
      prismaMock.watchItem.findMany.mockResolvedValue([]);
      prismaMock.user.delete.mockResolvedValue({ id: 3 });
      const res = await service.deleteProfile(3);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(res).toEqual({ deleted: true });
    });
  });

  describe('recommend()', () => {
    it('returns films in top genres', async () => {
      const items = [
        { film: { id: 10, genres: [{ id: 5 }, { id: 6 }], reviews: [] } },
        { film: { id: 11, genres: [{ id: 6 }], reviews: [] } },
      ];
      prismaMock.watchItem.findMany.mockResolvedValue(items);
      prismaMock.film.findMany.mockResolvedValue([{ id: 6 }]);
      const res = await service.recommend(1);
      expect(prismaMock.film.findMany).toHaveBeenCalledWith({
        where: { genres: { some: { id: { in: [6, 5] } } } },
        take: 10,
        include: { genres: true },
      });
      expect(res).toEqual([{ id: 6 }]);
    });
  });

  describe('getAllUsers()', () => {
    it('selects limited fields', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 4, email: 'a', name: 'n', role: Role.USER },
      ]);
      const res = await service.getAllUsers();
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        select: { id: true, email: true, name: true, role: true },
      });
      expect(res[0].role).toBe(Role.USER);
    });
  });

  describe('updateUserRole()', () => {
    it('throws if user missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.updateUserRole(5, Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates and selects fields', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 5 });
      prismaMock.user.update.mockResolvedValue({
        id: 5,
        email: 'e',
        name: 'n',
        role: Role.ADMIN,
      });
      const res = await service.updateUserRole(5, Role.ADMIN);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { role: Role.ADMIN },
        select: { id: true, email: true, name: true, role: true },
      });
      expect(res.role).toBe(Role.ADMIN);
    });
  });

  describe('deleteUser()', () => {
    it('throws if user missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.deleteUser(6)).rejects.toThrow(NotFoundException);
    });

    it('runs transaction and returns message', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 6 });
      prismaMock.$transaction.mockResolvedValue(undefined);
      const res = await service.deleteUser(6);
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(res).toEqual({ message: 'User successfully deleted' });
    });
  });
});
