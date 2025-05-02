import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
} from 'class-validator';
import { FilmType } from '@prisma/client';

export class CreateFilmDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  releaseYear?: number;

  @IsEnum(FilmType)
  type: FilmType;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  genres?: number[];
}
