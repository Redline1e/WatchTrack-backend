import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.genre.findMany();
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }

  create(dto: CreateGenreDto) {
    return this.prisma.genre.create({ data: dto });
  }

  update(id: number, dto: UpdateGenreDto) {
    return this.prisma.genre.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.genre.delete({ where: { id } });
  }
}
