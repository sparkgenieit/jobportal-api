import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryItem, GalleryItemSchema } from './schema/gallery-grid';
import { GalleryGridService } from './gallery-grid.service';
import { GalleryGridController } from './gallery-grid.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: GalleryItem.name, schema: GalleryItemSchema }])],
  controllers: [GalleryGridController],
  providers: [GalleryGridService],
})
export class GalleryGridModule {}
