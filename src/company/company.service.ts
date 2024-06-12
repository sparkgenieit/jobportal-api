import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile } from './schema/companyProfile.schema';
import { CompanyProfileDto } from './dto/company-profile.dto';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    private jwtService: JwtService
  ) { }

  async updateProfile(user_id, companyProfileDto: CompanyProfileDto): Promise<any> {
    console.log(user_id);
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.companyProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.companyProfileModel.findOneAndUpdate({ user_id }, companyProfileDto);
    }
  }

  async getAllCompanies(): Promise<CompanyProfile[]> {
    return await this.companyProfileModel.find().exec()
  }

  async getCompany(user_id): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.companyProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.companyProfileModel.findOne({ user_id });
    }
  }

  async getAppliedUsers(jobId, limit: number, skip: number) {
    jobId = new mongoose.Types.ObjectId(jobId);
    let count = await this.UserJobsModel.countDocuments({ jobId: jobId, applied: true });
    let users = await this.UserJobsModel.find({ jobId: jobId, applied: true }).sort({ applied_date: - 1 }).limit(limit).skip(skip).populate('userId').populate("jobId", "jobTitle");
    return {
      users: users,
      total: count,
      status: 200
    }
  }
}
