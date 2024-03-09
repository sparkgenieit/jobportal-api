import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Jobs } from './schema/Jobs.schema';
import { JobsDto } from './dto/jobs.dto';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
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
    const isJob = await this.jobsModel.findOne({ id:jobId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'queue';
      return await this.jobsModel.findOneAndUpdate({ id:jobId }, jobsDto);
    }
  }

  async assignJob({adminId, jobId, jobsDto}): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    
    const isUser = await this.userModel.findOne({ adminId });
    const isJob = await this.jobsModel.findOne({ id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.status = 'review';
      return await this.jobsModel.findOneAndUpdate({  id:jobId }, jobsDto);
    }
  }

  async approveJob({adminId, jobId, jobsDto}): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    
    const isUser = await this.userModel.findOne({ adminId });
    const isJob = await this.jobsModel.findOne({ id:jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'approved';
      return await this.jobsModel.findOneAndUpdate({ adminId, id:jobId }, jobsDto);
    }
  }

  async rejectJob({adminId, jobId, jobsDto}): Promise<any> {
    //adminId = new mongoose.Types.ObjectId(adminId);
    jobId = new mongoose.Types.ObjectId(jobId);
    
    //const isUser = await this.userModel.findOne({ adminId });
    const isUser = true;
    const isJob = await this.jobsModel.findOne({ jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exsit" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'rejected';
      return await this.jobsModel.findOneAndUpdate({  adminId, id:jobId }, jobsDto);
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
    return await this.jobsModel.find({ adminId}).exec()
  }

  async getPostedJobs(companyId):Promise<Jobs[]>{
    return await this.jobsModel.find({ companyId}).exec()
  }


  async getJob(id): Promise<any> {
    const isJob = await this.jobsModel.findOne({ jobId:id });
    console.log(isJob);
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.jobsModel.findOne({ id });
    }
  }
}
