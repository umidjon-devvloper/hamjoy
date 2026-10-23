import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { UploadsService } from './uploads.service';

const PresignSchema = z.object({
  kind: z.enum(['listing', 'verify', 'avatar', 'chat']),
  contentType: z.string().min(3).max(128),
  byteSize: z.number().int().positive().max(25 * 1024 * 1024).optional(),
});
type PresignDto = z.infer<typeof PresignSchema>;

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly svc: UploadsService) {}

  @Get('config')
  config() {
    return { enabled: this.svc.isEnabled() };
  }

  @Post('presign')
  presign(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(PresignSchema)) dto: PresignDto,
  ) {
    return this.svc.presign(user.id, dto.kind, dto.contentType, dto.byteSize);
  }
}
