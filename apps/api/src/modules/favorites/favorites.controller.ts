import { Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly svc: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.svc.listMine(user.id);
  }

  @Post(':listingId')
  add(@CurrentUser() user: AuthUser, @Param('listingId', new ParseUUIDPipe()) listingId: string) {
    return this.svc.toggle(user.id, listingId);
  }

  @Delete(':listingId')
  remove(@CurrentUser() user: AuthUser, @Param('listingId', new ParseUUIDPipe()) listingId: string) {
    return this.svc.toggle(user.id, listingId);
  }
}
