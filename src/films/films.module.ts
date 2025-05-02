import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
@Module({
  imports: [PrismaModule],
  providers: [FilmsService],
  controllers: [FilmsController],
})
export class FilmsModule {}
