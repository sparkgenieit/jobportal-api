import { HttpException, HttpStatus, Injectable, Search } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Jobs } from './schema/Jobs.schema';
import { JobsDto } from './dto/jobs.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';


@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async createJob(jobsDto: JobsDto): Promise<any> {
    // const isJob = await this.userModel.findOne({email});
    // if (isUser) {
    //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
    // }

    //CreateUserDto.token = '';
    jobsDto.status = 'queue';
    return await this.jobsModel.create(jobsDto);

  }

  async updateJob(jobId, jobsDto: JobsDto): Promise<any> {
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'queue';
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async assignJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);

    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.status = 'review';
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async releaseJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);

    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = "";
      jobsDto.status = 'queue';
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async applyJob({ userId, jobId, applied, applied_date }): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const isUser = await this.userModel.findOne({ _id: userId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      const isAppliedJob = await this.UserJobsModel.findOne({ userId, jobId });
      if (isAppliedJob) {
        return await this.UserJobsModel.findOneAndUpdate({ _id: isAppliedJob }, { userId, jobId, applied, applied_date });
      } else {
        return await this.UserJobsModel.create({ userId, jobId, applied, applied_date });
      }
    }
  }

  async saveJob({ userId, jobId, saved, saved_date }): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const isUser = await this.userModel.findOne({ _id: userId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      const isSavedJob = await this.UserJobsModel.findOne({ userId, jobId });
      if (isSavedJob) {
        return await this.UserJobsModel.findOneAndUpdate({ _id: isSavedJob }, { userId, jobId, saved, saved_date });
      } else {
        return await this.UserJobsModel.create({ userId, jobId, saved, saved_date });
      }
    }
  }

  async approveJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);

    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.status = 'approved';
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async rejectJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.status = 'rejected';
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async getAllJobs(limit: number, skip: number) {
    const count = await this.jobsModel.countDocuments().exec();
    const data = await this.jobsModel.find().skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getFilterJobs(data: any, limit: number, skip: number) {
    let query: any = {
      status: "approved",
    };
    if (data.search && data.search.trim() !== "") {
      query.$text = { $search: new RegExp(data.search, 'i') };
    }
    if (data.location && data.location.trim() !== "") {
      query.location = new RegExp(data.location, 'i');
    }
    if (data.jobCategory && data.jobCategory.trim() !== "") {
      query.jobCategory = new RegExp(data.jobCategory, 'i');
    }
    if (data.subCategory && data.subCategory.trim() !== "") {
      query.subCategory = new RegExp(data.subCategory, 'i');
    }
    if (data.duration && data.duration.trim() !== "") {
      query.duration = new RegExp(data.duration, 'i')
    }
    if (data.rateperhour && data.rateperhour.trim() !== "") {
      query.rateperhour = { $lt: data.rateperhour }
    }
    if (data.weeklyperhour && data.weeklyperhour.trim() !== "") {
      query.weeklyperhour = { $lt: data.weeklyperhour }
    }
    if (data.jobtype && data.jobtype.trim() !== "") {
      query.jobtype = new RegExp(data.jobtype, 'i');
    }
    if (data.company && data.company.trim() !== "") {
      query.company = new RegExp(data.company, 'i');
    }

    const total = await this.jobsModel.countDocuments(query).exec();
    const jobs = await this.jobsModel.find(query).skip(skip).limit(limit).sort({ creationdate: - 1 }).exec();
    return {
      jobs: jobs,
      total: total,
      status: 200,
    }
  }

  async getApprovedJobs(limit: number, skip: number) {
    const count = await this.jobsModel.countDocuments({ 'status': 'approved' }).exec();
    const data = await this.jobsModel.find({ 'status': 'approved' }).skip(skip).limit(limit).sort({ creationdate: - 1 }).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getQueueJobs(limit: number, skip: number) {
    const count = await this.jobsModel.countDocuments({ 'status': 'queue' }).exec();
    const data = await this.jobsModel.find({ 'status': 'queue' }).skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getAssignedJobs(adminId, limit: number, skip: number) {
    adminId = new mongoose.Types.ObjectId(adminId);
    const count = await this.jobsModel.countDocuments({ adminId }).exec();
    const data = await this.jobsModel.find({ adminId }).skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }

  }

  async getAppliedJobs(userId): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);

    return await this.UserJobsModel.find({ userId }).exec()
  }

  async getSavedJobs(userId): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);

    return await this.UserJobsModel.find({ userId }).exec()
  }

  async getPostedJobs(companyId, limit: number, skip: number) {
    //companyId = new mongoose.Types.ObjectId(companyId);
    const count = await this.jobsModel.countDocuments({ companyId: companyId }).exec();
    const data = await this.jobsModel.find({ companyId: companyId }).skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }


  async getJob(jobId): Promise<any> {
    jobId = new mongoose.Types.ObjectId(jobId);

    const isJob = await this.jobsModel.findOne({ _id: jobId });
    console.log(isJob);
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.jobsModel.findOne({ _id: jobId });
    }
  }
}
