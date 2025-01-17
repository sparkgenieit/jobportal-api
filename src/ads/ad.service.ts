import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Ad } from './schema/Ad.schema';
import { AdDto, AdStatus } from './dto/ad.dto';


@Injectable()
export class AdService {
  constructor(
    @InjectModel(Ad.name) private readonly adsModel: Model<Ad>,

  ) { }

  async createAd(adsDto: AdDto) {
    return await this.adsModel.create(adsDto);
  }

  async createCompanyAd(adsDto: AdDto) {
    adsDto.status = AdStatus.REVIEW
    return await this.adsModel.create(adsDto);
  }

  async getSpecificPageAds(page: string) {
    const regex = new RegExp(page, 'i') // Eliminating any possibility of any case sensitive issues
    return await this.adsModel.find({ show_on_pages: { $in: [regex] }, status: AdStatus.LIVE }).sort({ data: 1 });
  }

  async showAd(type: string) {
    const ads = await this.adsModel.aggregate([
      { $match: { ad_type: type } },
      { $sample: { size: 1 } }
    ])

    return ads[0]
  }

  async updateAd(adId: string, adsDto: AdDto): Promise<any> {
    const isAd = await this.adsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adsModel.findOneAndUpdate({ _id: adId }, adsDto);
    }
  }

  async getAds(): Promise<Ad[]> {
    return await this.adsModel.find().exec()
  }

  async getCompanyAds(id: string): Promise<Ad[]> {
    return await this.adsModel.find({ posted_by: id }).exec()
  }

  async getAd(adId: string | Types.ObjectId) {
    adId = new mongoose.Types.ObjectId(adId);

    const isAd = await this.adsModel.findOne({ _id: adId });

    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adsModel.findOne({ _id: adId });
    }
  }


  async deleteAd(adId: string | Types.ObjectId): Promise<any> {

    adId = new mongoose.Types.ObjectId(adId);

    const isAd = await this.adsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new NotFoundException("The given Ad does not exist");
    } else {
      return await this.adsModel.deleteOne({ _id: adId })
    }
  }
}
