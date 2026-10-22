import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { PushService } from './push.service';

const RegisterSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  token: z.string().min(10).max(4096),
});
type RegisterDto = z.infer<typeof RegisterSchema>;

const UnregisterSchema = z.object({
  token: z.string().min(10).max(4096),
});
type UnregisterDto = z.infer<typeof UnregisterSchema>;

@ApiTags('devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly push: PushService) {}

  @Post('register')
  register(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
  ) {
    return this.push.registerToken(user.id, dto.platform, dto.token);
  }

  @Delete('register')
  unregister(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UnregisterSchema)) dto: UnregisterDto,
  ) {
    return this.push.removeToken(user.id, dto.token);
  }
}
