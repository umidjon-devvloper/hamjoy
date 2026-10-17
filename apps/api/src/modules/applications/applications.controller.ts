import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ApplicationsService } from './applications.service';
import { ApplySchema, UpdateStatusSchema, type ApplyDto, type UpdateStatusDto } from './dto';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly svc: ApplicationsService) {}

  @Post()
  apply(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ApplySchema)) dto: ApplyDto,
  ) {
    return this.svc.apply(user.id, dto.listingId, dto.coverLetter ?? null);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.svc.listMine(user.id);
  }

  @Get('received')
  received(@CurrentUser() user: AuthUser) {
    return this.svc.listReceived(user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
  ) {
    return this.svc.updateStatus(user.id, id, dto.status);
  }
}
