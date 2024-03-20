import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Jobs } from './schema/Jobs.schema';
import { JobsDto } from './dto/jobs.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { UserJobsDto } from 'src/users/dto/user-jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel:Model<User>
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
    const isJob = await this.jobsModel.findOne({ jobId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'queue';
      return await this.jobsModel.findOneAndUpdate({ id:jobId }, jobsDto);
    }
  }

  async assignJob({adminId, jobId, jobsDto}): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    
    const isUser = await this.userModel.findOne({ _id:adminId });
    const isJob = await this.jobsModel.findOne({ _id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.status = 'review';
      return await this.jobsModel.findOneAndUpdate({  _id:jobId }, jobsDto);
    }
  }

  async releaseJob({adminId, jobId, jobsDto}): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    
    const isUser = await this.userModel.findOne({ _id:adminId });
    const isJob = await this.jobsModel.findOne({ _id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = "";
      jobsDto.status = 'queue';
      return await this.jobsModel.findOneAndUpdate({  _id:jobId }, jobsDto);
    }
  }

  async applyJob({userId, jobId, applied}): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);
    
    const isUser = await this.userModel.findOne({ _id:userId });
    const isJob = await this.jobsModel.findOne({ _id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      const isAppliedJob = await this.UserJobsModel.findOne({ userId, jobId });
      if(isAppliedJob){
        return await this.UserJobsModel.findOneAndUpdate({  _id:isAppliedJob }, { userId, jobId, applied });
      }else{
        return await this.UserJobsModel.create({ userId, jobId, applied });
      }
    }
  }

  async saveJob({userId, jobId, saved}): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);
    
    const isUser = await this.userModel.findOne({ _id:userId });
    const isJob = await this.jobsModel.findOne({ _id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      const isSavedJob = await this.UserJobsModel.findOne({ userId, jobId });
      if(isSavedJob){
        return await this.UserJobsModel.findOneAndUpdate({  _id:isSavedJob }, { userId, jobId, saved });
      }else{
        return await this.UserJobsModel.create({ userId, jobId, saved });
      }
    }
  }

  async approveJob({adminId, jobId, jobsDto}): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    
    const isUser = await this.userModel.findOne({ _id:adminId });
    const isJob = await this.jobsModel.findOne({ _id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'approved';
      return await this.jobsModel.findOneAndUpdate({ _id:jobId }, jobsDto);
    }
  }

  async rejectJob({adminId, jobId, jobsDto}): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    jobId = new mongoose.Types.ObjectId(jobId);
    
    const isUser = await this.userModel.findOne({ _id:adminId });
    const isJob = await this.jobsModel.findOne({ _id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'rejected';
      return await this.jobsModel.findOneAndUpdate({  _id:jobId }, jobsDto);
    }
  }

  async getAllJobs(): Promise<Jobs[]> {
    return await this.jobsModel.find().exec()
  }

  async getApprovedJobs():Promise<Jobs[]>{
    return await this.jobsModel.find({'status': 'approved'}).exec()
  }

  async getQueueJobs():Promise<Jobs[]>{
    return await this.jobsModel.find({'status': 'queue'}).exec()
  }

  async getAssignedJobs(adminId):Promise<Jobs[]>{
    adminId = new mongoose.Types.ObjectId(adminId);

    return await this.jobsModel.find({ adminId}).exec()
  }

  async getAppliedJobs(userId):Promise<any>{
    userId = new mongoose.Types.ObjectId(userId);

    return await this.UserJobsModel.find({ userId}).exec()
  }

  async getSavedJobs(userId):Promise<any>{
    userId = new mongoose.Types.ObjectId(userId);

    return await this.UserJobsModel.find({userId}).exec()
  }

  async getPostedJobs(companyId):Promise<Jobs[]>{
    //companyId = new mongoose.Types.ObjectId(companyId);
    return await this.jobsModel.find({ companyId:companyId}).exec()
  }


  async getJob(jobId): Promise<any> {
    jobId = new mongoose.Types.ObjectId(jobId);

    const isJob = await this.jobsModel.findOne({ _id:jobId });
    console.log(isJob);
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.jobsModel.findOne({ _id:jobId });
    }
  }
}
