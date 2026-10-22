import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { UsersService } from './users.service';

const UpdateMeSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  cityId: z.number().int().positive().nullable().optional(),
});
type UpdateMeDto = z.infer<typeof UpdateMeSchema>;

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.getMe(user.id);
  }

  @Patch('me')
  update(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateMeSchema)) patch: UpdateMeDto,
  ) {
    return this.users.updateMe(user.id, patch);
  }

  @Roles('admin', 'moderator')
  @Patch(':id/trust')
  setTrust(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(z.object({ trusted: z.boolean() }))) body: { trusted: boolean },
  ) {
    return this.users.setTrusted(id, body.trusted);
  }
}
