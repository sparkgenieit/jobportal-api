
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryAd, GalleryAdSchema } from './schema/gallery-ad';
import { GalleryAdService } from './gallery-ad.service';
import { GalleryAdController } from './gallery-ad.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: GalleryAd.name, schema: GalleryAdSchema }])],
  controllers: [GalleryAdController],
  providers: [GalleryAdService],
})
export class GalleryAdModule {}
