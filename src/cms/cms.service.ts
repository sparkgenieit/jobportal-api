import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Cms } from './schema/cms';
import { CmsDto } from './dto/cms.dto';


@Injectable()
export class CmsService {
  constructor(
    @InjectModel(Cms.name)
    private cmsModel: Model<Cms>
  ) {}

  async createOrUpdate(dto: CmsDto): Promise<Cms> {
    const { category, page, content } = dto;

    const existing = await this.cmsModel.findOne({ category, page });

    if (existing) {
      existing.content = content;
      return existing.save();
    }

    return this.cmsModel.create(dto);
  }

  async findOne(category: string, page: string): Promise<Cms | null> {
    return this.cmsModel.findOne({ category, page });
  }
}
