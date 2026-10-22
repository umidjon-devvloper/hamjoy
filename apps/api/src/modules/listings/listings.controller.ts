import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Public } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateListingSchema, SearchQuerySchema, UpdateListingSchema, type CreateListingDto, type SearchQueryDto, type UpdateListingDto } from './dto';
import { ListingsService } from './listings.service';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly svc: ListingsService) {}

  @Public()
  @Get('search')
  search(@Query(new ZodValidationPipe(SearchQuerySchema)) q: SearchQueryDto) {
    return this.svc.searchActive(q);
  }

  @ApiBearerAuth()
  @Get('mine')
  mine(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.svc.mine(user, status);
  }

  @Public()
  @Get(':id')
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.getById(id);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateListingSchema)) dto: CreateListingDto,
  ) {
    return this.svc.create(user, dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateListingSchema)) patch: UpdateListingDto,
  ) {
    return this.svc.update(user, id, patch);
  }

  @ApiBearerAuth()
  @Post(':id/publish')
  publish(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.publish(user, id);
  }

  @ApiBearerAuth()
  @Post(':id/mark-sold')
  markSold(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.markSold(user, id);
  }

  @ApiBearerAuth()
  @Post(':id/reopen')
  reopen(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.reopen(user, id);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(user, id);
  }

  @ApiBearerAuth()
  @Roles('moderator', 'admin')
  @Post(':id/moderate')
  moderate(@Param('id', new ParseUUIDPipe()) id: string, @Body('decision') decision: 'approve' | 'reject' | 'block') {
    return this.svc.moderate(id, decision);
  }
}
