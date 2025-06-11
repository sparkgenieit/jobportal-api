import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Meta } from './schema/meta.schema';
import { MetaDto } from './dto/meta.dto';


@Injectable()
export class MetaService {
  constructor(
    @InjectModel(Meta.name)
    private metaModel: Model<Meta>
  ) {}

  async createOrUpdate(dto: MetaDto): Promise<Meta> {
  const { category, page, title, keywords, description } = dto;

  const existing = await this.metaModel.findOne({ category, page });

  if (existing) {
    existing.title = title;
    existing.keywords = keywords;
    existing.description = description;
    return existing.save();
  }

  return this.metaModel.create({ category, page, title, keywords, description });
}


  async findOne(category: string, page: string): Promise<Meta | null> {
    return this.metaModel.findOne({ category, page });
  }
}
