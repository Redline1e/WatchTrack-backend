
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Multer } from 'multer';


type FilmWithAvg = {
  id: number;
  title: string;
  description: string | null;
  releaseYear: number | null;
  type: string;
  genres: { id: number; name: string }[];
  ratingAvg: number;
  photoUrl: string | null;
};

@Injectable()
export class FilmsService {
  constructor(private readonly prisma: PrismaService) {}

 
  async findAll(): Promise<FilmWithAvg[]> {
    const films = await this.prisma.film.findMany({
      include: { genres: true, reviews: true },
      orderBy: { id: 'desc' },
    });

    return films.map((f) => {
      const sum = f.reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = f.reviews.length ? sum / f.reviews.length : 0;
      return {
        id: f.id,
        title: f.title,
        description: f.description,
        releaseYear: f.releaseYear,
        type: f.type,
        genres: f.genres,
        ratingAvg: parseFloat(avg.toFixed(1)),
        photoUrl: f.photoUrl,
      };
    });
  }

  
  async findOne(id: number): Promise<FilmWithAvg> {
    const film = await this.prisma.film.findUnique({
      where: { id },
      include: { genres: true, reviews: true },
    });
    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    const sum = film.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = film.reviews.length ? sum / film.reviews.length : 0;
    return {
      id: film.id,
      title: film.title,
      description: film.description,
      releaseYear: film.releaseYear,
      type: film.type,
      genres: film.genres,
      ratingAvg: parseFloat(avg.toFixed(1)),
      photoUrl: film.photoUrl,
    };
  }
  
  create(dto: CreateFilmDto) {
    const genreIds = dto.genres ?? [];
    return this.prisma.film.create({
      data: {
        title: dto.title,
        description: dto.description,
        releaseYear: dto.releaseYear,
        type: dto.type,
        genres: { connect: genreIds.map((id) => ({ id })) },
      },
    });
  }

  update(id: number, dto: UpdateFilmDto) {
    const genreIds = dto.genres ?? [];
    return this.prisma.film.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        releaseYear: dto.releaseYear,
        type: dto.type,
        genres: { set: genreIds.map((id) => ({ id })) },
      },
    });
  }

  
  remove(id: number) {
    return this.prisma.film.delete({ where: { id } });
  }

  
  savePhoto(id: number, file: Multer.File) {
    const url = `/uploads/${file.filename}`;
    return this.prisma.film.update({
      where: { id },
      data: { photoUrl: url },
    });
  }
}
