import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  check() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
