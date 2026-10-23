import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { DbModule } from './db/db.module';
import { RedisModule } from './redis/redis.module';
import { MeiliModule } from './meili/meili.module';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ListingsModule } from './modules/listings/listings.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { VerificationsModule } from './modules/verifications/verifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    RedisModule,
    MeiliModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    LocationsModule,
    ListingsModule,
    FavoritesModule,
    ChatsModule,
    ApplicationsModule,
    NotificationsModule,
    PromotionsModule,
    ReviewsModule,
    VerificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
