import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Public } from '../../common/jwt-auth.guard';
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
}
