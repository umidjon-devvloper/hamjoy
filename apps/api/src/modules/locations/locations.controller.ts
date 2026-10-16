import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/jwt-auth.guard';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly svc: LocationsService) {}

  @Public()
  @Get()
  list() {
    return this.svc.tree();
  }
}
