import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ModerationService } from './moderation.service';

const ReportSchema = z.object({
  targetType: z.enum(['user', 'listing', 'message']),
  targetId: z.string().min(1).max(128),
  reason: z.string().min(3).max(1000),
});
type ReportDto = z.infer<typeof ReportSchema>;

@ApiTags('moderation')
@ApiBearerAuth()
@Controller()
export class ModerationController {
  constructor(private readonly svc: ModerationService) {}

  @Post('reports')
  report(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ReportSchema)) dto: ReportDto,
  ) {
    return this.svc.submitReport(user, dto);
  }

  @Post('users/:id/block')
  block(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.block(user, id);
  }

  @Delete('users/:id/block')
  unblock(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.unblock(user, id);
  }

  @Get('users/me/blocks')
  myBlocks(@CurrentUser() user: AuthUser) {
    return this.svc.myBlocks(user.id);
  }

  @Roles('admin', 'moderator')
  @Get('admin/reports')
  adminList(@Query('status') status?: 'open' | 'resolved' | 'dismissed') {
    return this.svc.listReports(status);
  }

  @Roles('admin', 'moderator')
  @Post('admin/reports/:id/resolve')
  resolve(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.decideReport(id, 'resolved');
  }

  @Roles('admin', 'moderator')
  @Post('admin/reports/:id/dismiss')
  dismiss(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.decideReport(id, 'dismissed');
  }
}
