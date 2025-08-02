import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryAd } from './schema/gallery-ad';
import { CreateGalleryAdDto } from './dto/gallery-ad.dto';

@Injectable()
export class GalleryAdService {
  constructor(@InjectModel(GalleryAd.name) private model: Model<GalleryAd>) {}

  async create(dto: CreateGalleryAdDto): Promise<GalleryAd> {
    return this.model.create(dto);
  }
  async updateGalleryAd(id: string, dto: CreateGalleryAdDto) {
    const existing = await this.model.findById(id);
    if (!existing) throw new NotFoundException('GalleryAd not found');

    Object.assign(existing, dto);
    return await existing.save();
  }

  async findAll(): Promise<GalleryAd[]> {
    return this.model.find().sort({ createdAt: -1 });
  }

  async findByCategoryOrLocation(category?: string, location?: string) {
    const query: any = {};
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<GalleryAd> {
    const ad = await this.model.findById(id);
    if (!ad) throw new NotFoundException('GalleryAd not found');
    return ad;
  }

  async remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
