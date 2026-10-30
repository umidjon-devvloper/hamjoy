import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Roles } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AdminService } from './admin.service';

const SetUserStatusSchema = z.object({
  status: z.enum(['active', 'blocked']),
});

const CreateCategorySchema = z.object({
  slug: z.string().min(1),
  nameUz: z.string().min(1),
  nameRu: z.string().min(1),
  icon: z.string().optional(),
  parentId: z.number().int().optional(),
});

const UpdateCategorySchema = z.object({
  slug: z.string().optional(),
  nameUz: z.string().optional(),
  nameRu: z.string().optional(),
  icon: z.string().optional(),
});

const CreateLocationSchema = z.object({
  nameUz: z.string().min(1),
  nameRu: z.string().min(1),
  parentId: z.number().int().optional(),
});

const UpdateLocationSchema = z.object({
  nameUz: z.string().optional(),
  nameRu: z.string().optional(),
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

  @Roles('admin', 'moderator')
  @Get('categories')
  listCategories() {
    return this.svc.listCategories();
  }

  @Roles('admin')
  @Post('categories')
  createCategory(@Body(new ZodValidationPipe(CreateCategorySchema)) body: z.infer<typeof CreateCategorySchema>) {
    return this.svc.createCategory(body);
  }

  @Roles('admin')
  @Patch('categories/:id')
  updateCategory(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) body: z.infer<typeof UpdateCategorySchema>,
  ) {
    return this.svc.updateCategory(id, body);
  }

  @Roles('admin')
  @Delete('categories/:id')
  deleteCategory(@Param('id', new ParseIntPipe()) id: number) {
    return this.svc.deleteCategory(id);
  }

  @Roles('admin', 'moderator')
  @Get('locations')
  listLocations() {
    return this.svc.listLocations();
  }

  @Roles('admin')
  @Post('locations')
  createLocation(@Body(new ZodValidationPipe(CreateLocationSchema)) body: z.infer<typeof CreateLocationSchema>) {
    return this.svc.createLocation(body);
  }

  @Roles('admin')
  @Patch('locations/:id')
  updateLocation(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ZodValidationPipe(UpdateLocationSchema)) body: z.infer<typeof UpdateLocationSchema>,
  ) {
    return this.svc.updateLocation(id, body);
  }

  @Roles('admin')
  @Delete('locations/:id')
  deleteLocation(@Param('id', new ParseIntPipe()) id: number) {
    return this.svc.deleteLocation(id);
  }
}
