import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryItem } from './schema/gallery-grid';
import { CreateGalleryItemDto } from './dto/gallery-grid.dto';

@Injectable()
export class GalleryGridService {
  constructor(
    @InjectModel(GalleryItem.name) private readonly model: Model<GalleryItem>
  ) {}

  async create(data: CreateGalleryItemDto) {
    return this.model.create(data);
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findByCategoryOrLocation(category?: string, location?: string) {
    const query: any = {};
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOneById(id: string) {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException(`Gallery item with ID ${id} not found`);
    return item;
  }

  async update(id: string, data: CreateGalleryItemDto) {
    const updated = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) throw new NotFoundException(`Gallery item with ID ${id} not found`);
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Gallery item with ID ${id} not found`);
    return deleted;
  }
}
