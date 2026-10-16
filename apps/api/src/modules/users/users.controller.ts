import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
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
  @UsePipes(new ZodValidationPipe(UpdateMeSchema))
  update(@CurrentUser() user: AuthUser, @Body() patch: UpdateMeDto) {
    return this.users.updateMe(user.id, patch);
  }
}
