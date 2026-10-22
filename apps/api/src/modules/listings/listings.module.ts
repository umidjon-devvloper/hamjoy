import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { ListingsSearch } from './listings.search';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [PromotionsModule],
  controllers: [ListingsController],
  providers: [ListingsService, ListingsSearch],
  exports: [ListingsService],
})
export class ListingsModule {}
