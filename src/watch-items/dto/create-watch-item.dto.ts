import { IsInt, IsEnum } from 'class-validator';
import { WatchStatus } from '@prisma/client';
export class CreateWatchItemDto {
  @IsInt() filmId: number;
  @IsEnum(WatchStatus) status: WatchStatus;
}
