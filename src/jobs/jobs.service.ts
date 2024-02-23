import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Jobs } from './schema/Jobs.schema';
import { JobsDto } from './dto/jobs.dto';

@Injectable()
export class JobsService {
    constructor(
        @InjectModel(Jobs.name) private readonly jobsModel:Model<Jobs>,
        private jwtService: JwtService
    ){}

    async createJob(jobsDto:JobsDto):Promise<any>{
      // const isJob = await this.userModel.findOne({email});
      // if (isUser) {
      //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
      // }

      //CreateUserDto.token = '';
      return await this.jobsModel.create(jobsDto);
    
    }

    async updateJob(user_id, jobsDto:JobsDto):Promise<any>{
        console.log(user_id);
     user_id = new mongoose.Types.ObjectId(user_id);
      const isUser = await this.jobsModel.findOne({user_id});
      if (!isUser) {
        throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        return await this.jobsModel.findOneAndUpdate({user_id}, jobsDto);
      }
  }

    async getAllJobs():Promise<Jobs[]>{
        return await this.jobsModel.find().exec()
    }

    async getJobs(id):Promise<any>{
      const isJob = await this.jobsModel.findOne({id});
      console.log(isJob);
      if (!isJob) {
        throw new HttpException({message: "The given Job does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        return await this.jobsModel.findOne({id});
      }
  }

  async getJob(user_id):Promise<any>{
    user_id = new mongoose.Types.ObjectId(user_id);
    
    console.log(user_id);
    const isUser = await this.jobsModel.findOne({user_id});
    console.log(isUser);
    if (!isUser) {
      throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
    }else{
      return await this.jobsModel.findOne({user_id});
    }
  }
}
