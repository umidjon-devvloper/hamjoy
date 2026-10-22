import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Public } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { PROMO_TARIFFS, StartPromoSchema, type StartPromoDto } from './dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly svc: PromotionsService) {}

  @Public()
  @Get('tariffs')
  tariffs() {
    return PROMO_TARIFFS;
  }

  @ApiBearerAuth()
  @Post()
  start(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(StartPromoSchema)) dto: StartPromoDto,
  ) {
    return this.svc.start(user, dto.listingId, dto.tier);
  }

  @ApiBearerAuth()
  @Roles('admin', 'moderator')
  @Post('admin/grant')
  grant(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(StartPromoSchema)) dto: StartPromoDto,
  ) {
    return this.svc.start(user, dto.listingId, dto.tier, { admin: true });
  }

  @Public()
  @Get('top')
  async top() {
    const items = await this.svc.topListingIds(20);
    return items.map((i) => ({ id: i.id, tier: i.tier, expiresAt: i.expiresAt.toISOString() }));
  }
}
