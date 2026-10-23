import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { VerificationsService } from './verifications.service';

const SubmitSchema = z.object({
  idDocumentUrl: z.string().url().max(2048),
  selfieUrl: z.string().url().max(2048),
});
type SubmitDto = z.infer<typeof SubmitSchema>;

const DecideSchema = z.object({
  note: z.string().max(1000).optional(),
});
type DecideDto = z.infer<typeof DecideSchema>;

@ApiTags('verifications')
@ApiBearerAuth()
@Controller()
export class VerificationsController {
  constructor(private readonly svc: VerificationsService) {}

  @Post('users/me/verify')
  submit(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(SubmitSchema)) dto: SubmitDto,
  ) {
    return this.svc.submit(user, dto);
  }

  @Get('users/me/verify')
  mine(@CurrentUser() user: AuthUser) {
    return this.svc.myLatest(user.id);
  }

  @Roles('admin', 'moderator')
  @Get('admin/verifications')
  pending(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 100;
    return this.svc.listPending(Number.isFinite(n) ? n : 100);
  }

  @Roles('admin', 'moderator')
  @Post('admin/verifications/:id/approve')
  approve(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(DecideSchema)) dto: DecideDto,
  ) {
    return this.svc.decide(user, id, 'approve', dto.note);
  }

  @Roles('admin', 'moderator')
  @Post('admin/verifications/:id/reject')
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(DecideSchema)) dto: DecideDto,
  ) {
    return this.svc.decide(user, id, 'reject', dto.note);
  }
}
