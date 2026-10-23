import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Public } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateReviewSchema, type CreateReviewDto } from './dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly svc: ReviewsService) {}

  @ApiBearerAuth()
  @Post('reviews')
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateReviewSchema)) dto: CreateReviewDto,
  ) {
    return this.svc.create(user, dto);
  }

  @Public()
  @Get('users/:id/reviews')
  list(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.listForUser(id);
  }

  @Public()
  @Get('users/:id/stats')
  stats(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.statsForUser(id);
  }

  @Public()
  @Get('users/:id/history')
  history(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.userHistory(id);
  }

  @ApiBearerAuth()
  @Roles('admin', 'moderator')
  @Get('admin/reviews')
  recent(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 100;
    return this.svc.listRecent(Number.isFinite(n) ? n : 100);
  }

  @ApiBearerAuth()
  @Roles('admin', 'moderator')
  @Get('admin/reviews/stats')
  adminStats() {
    return this.svc.adminStats();
  }

  @ApiBearerAuth()
  @Roles('admin', 'moderator')
  @Delete('admin/reviews/:id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.adminDelete(id);
  }

  @ApiBearerAuth()
  @Roles('admin', 'moderator')
  @Post('admin/reviews/:id/hide')
  hide(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.setHidden(id, true);
  }

  @ApiBearerAuth()
  @Roles('admin', 'moderator')
  @Post('admin/reviews/:id/unhide')
  unhide(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.setHidden(id, false);
  }
}
