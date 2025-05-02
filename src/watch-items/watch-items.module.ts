import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WatchItemsService } from './watch-items.service';
import { WatchItemsController } from './watch-items.controller';

@Module({
  imports: [PrismaModule],
  providers: [WatchItemsService],
  controllers: [WatchItemsController],
})
export class WatchItemsModule {}
