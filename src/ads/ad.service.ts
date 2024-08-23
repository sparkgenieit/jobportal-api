import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Ad } from './schema/Ad.schema';
import { AdDto } from './dto/ad.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { UserJobsDto } from 'src/users/dto/user-jobs.dto';

@Injectable()
export class AdService {
  constructor(
    @InjectModel(Ad.name) private readonly adsModel: Model<Ad>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async createAd(adsDto: AdDto): Promise<any> {
    // const isJob = await this.userModel.findOne({email});
    // if (isUser) {
    //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
    // }

    //CreateUserDto.token = '';
    adsDto.status = 'active';
    return await this.adsModel.create(adsDto);

  }

  async updateAd(adId, adsDto: AdDto): Promise<any> {
    const isJob = await this.adsModel.findOne({ _id: adId });
    if (!isJob) {
      throw new HttpException({ message: "The given Ad does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adsModel.findOneAndUpdate({ _id: adId }, adsDto);
    }
  }

  async getAds(): Promise<Ad[]> {
    return await this.adsModel.find().exec()
  }

  async getAd(adId): Promise<any> {
    adId = new mongoose.Types.ObjectId(adId);

    const isAd = await this.adsModel.findOne({ _id: adId });
    console.log(isAd);
    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adsModel.findOne({ _id: adId });
    }
  }


  async deleteAd(adId): Promise<any> {
    console.log(adId);
    adId = new mongoose.Types.ObjectId(adId);
    //userProfileDto.user_id = user_id;
    const isAd = await this.adsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {

      return await this.adsModel.deleteOne({ _id: adId })
    }
  }
}
