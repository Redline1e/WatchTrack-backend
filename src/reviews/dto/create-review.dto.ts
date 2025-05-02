import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
export class CreateReviewDto {
  @IsInt() filmId: number;
  @IsInt() @Min(1) @Max(10) rating: number;
  @IsOptional() @IsString() comment?: string;
}
