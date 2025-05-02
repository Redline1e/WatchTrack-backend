import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock: any = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const jwtMock: any = {
    sign: jest.fn().mockReturnValue('token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // @ts-ignore
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
  });

  it('register hashes password and returns id/email', async () => {
    prismaMock.user.create.mockResolvedValue({ id: 1, email: 'a@b.com' });
    const result = await service.register({
      email: 'a@b.com',
      password: 'pass',
      name: 'Name',
    } as any);
    expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
    expect(result).toEqual({ id: 1, email: 'a@b.com' });
  });

  it('login throws for invalid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x', password: 'y' } as any),
    ).rejects.toThrow('Invalid credentials');
  });

  it('login returns token for valid user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      password: 'hashed',
      role: 'USER',
    });
    // @ts-ignore
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const result = await service.login({
      email: 'a@b.com',
      password: 'pass',
    } as any);
    expect(jwtMock.sign).toHaveBeenCalled();
    expect(result).toEqual({ access_token: 'token' });
  });
});
