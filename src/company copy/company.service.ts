import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile } from './schema/companyProfile.schema';
import { CompanyProfileDto } from './dto/company-profile.dto';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(CompanyProfile.name) private readonly companyProfileModel:Model<CompanyProfile>,
        private jwtService: JwtService
    ){}

    async updateProfile(user_id, companyProfileDto:CompanyProfileDto):Promise<any>{
        console.log(user_id);
     user_id = new mongoose.Types.ObjectId(user_id);
      const isUser = await this.companyProfileModel.findOne({user_id});
      if (!isUser) {
        throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        return await this.companyProfileModel.findOneAndUpdate({user_id}, companyProfileDto);
      }
  }

    async getAllCompanies():Promise<CompanyProfile[]>{
        return await this.companyProfileModel.find().exec()
    }

    async getCompany(user_id):Promise<any>{
      user_id = new mongoose.Types.ObjectId(user_id);
      
      console.log(user_id);
      const isUser = await this.companyProfileModel.findOne({user_id});
      console.log(isUser);
      if (!isUser) {
        throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        return await this.companyProfileModel.findOne({user_id});
      }
  }
}
