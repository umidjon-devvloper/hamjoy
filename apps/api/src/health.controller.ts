import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/jwt-auth.guard';

@ApiTags('health')
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  check() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
