import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { GalleryGridService } from './gallery-grid.service';
import { CreateGalleryItemDto } from './dto/gallery-grid.dto';

@Controller('gallery-grid')
export class GalleryGridController {
  constructor(private readonly service: GalleryGridService) {}

  // ✅ Create gallery item
  @Post()
  create(@Body() dto: CreateGalleryItemDto) {
    return this.service.create(dto);
  }

  // ✅ List all gallery items (optionally filter by category or location)
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string
  ) {
    return this.service.findByCategoryOrLocation(category, location);
  }

  // ✅ Get single item by ID (for editing)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(id);
  }

  // ✅ Update gallery item by ID
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateGalleryItemDto) {
    return this.service.update(id, dto);
  }

  // ✅ Delete gallery item by ID
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
