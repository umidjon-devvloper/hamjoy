import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AdminService } from './admin.service';

const SetUserStatusSchema = z.object({
  status: z.enum(['active', 'blocked']),
});

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Roles('admin', 'moderator')
  @Get('stats')
  stats() {
    return this.svc.getStats();
  }

  @Roles('admin', 'moderator')
  @Get('users')
  listUsers(@Query('status') status?: string, @Query('search') search?: string) {
    return this.svc.listUsers({ status, search });
  }

  @Roles('admin')
  @Patch('users/:id/status')
  setUserStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(SetUserStatusSchema)) body: { status: 'active' | 'blocked' },
  ) {
    return this.svc.setUserStatus(id, body.status);
  }

  @Roles('admin', 'moderator')
  @Get('listings')
  listListings(@Query('status') status?: string) {
    return this.svc.listListings({ status });
  }
}
