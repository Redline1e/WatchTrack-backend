import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilmsModule } from './films/films.module';
import { GenresModule } from './genres/genres.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { WatchItemsModule } from './watch-items/watch-items.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FilmsModule,
    GenresModule,
    ReviewsModule,
    UsersModule,
    WatchItemsModule,
  ],
  controllers: [
    HealthController, 
  ],
})
export class AppModule {}
