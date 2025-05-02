import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';

@Module({
  imports: [PrismaModule],
  providers: [GenresService],
  controllers: [GenresController],
  exports: [GenresService],
})
export class GenresModule {}
