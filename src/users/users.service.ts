import { HttpException, HttpStatus, Injectable, Param } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfile } from './schema/userProfile.schema';
import { UserJobsDto } from './dto/user-jobs.dto';
import { UserJobs } from './schema/userJobs.schema';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfileDto } from 'src/company/dto/company-profile.dto';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel:Model<User>,
        @InjectModel(UserProfile.name) private readonly userProfileModel:Model<UserProfile>,
        @InjectModel(UserJobs.name) private readonly userJobsModel:Model<UserJobs>,
       
        @InjectModel(CompanyProfile.name) private readonly companyProfileModel:Model<CompanyProfile>,
        private jwtService: JwtService
    ){}

    async findOne({email, password}: LoginUserDto): Promise<any> {
        const user = await this.userModel.findOne({email, password});
        if (!user) {
            throw new HttpException({message: 'Invalid Credentials'}, HttpStatus.BAD_REQUEST);
          //return {"msg": "Invaid Credentials"};
        }
        const payload = { username: user.first_name+" "+user.last_name, sub: user._id };
       //user.token  = this.jwtService.sign(payload);
      user.token  = '999';
       return user;
      }

    async createUser(createUserDto:CreateUserDto):Promise<any>{
        const email = createUserDto.email;
        const role = createUserDto.role;
        const isUser = await this.userModel.findOne({email});
        if (isUser) {
          throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
        }

        //CreateUserDto.token = '';
      //const user =   await this.userModel.create(createUserDto);
      return await this.userModel.create(createUserDto).then((res) => {
        
         const user = res;
          const payload = { username: res.first_name+" "+res.last_name, sub: res._id };
         
          user._id = res._id;
          //user.token  = this.jwtService.sign(payload);
          user.token  = '999';
          console.log("role", role);
         
          if(role == 'user'){
            const userProfileDto:UserProfileDto = {user_id: res._id, first_name: res.first_name, last_name: res.last_name, email: res.email};

            this.userProfileModel.create(userProfileDto);
          }

          if(role == 'employer'){
            const companyProfileDto:CompanyProfileDto = {
              user_id: res._id, 
              email: res.email,
              name:'',
              address1: '',
              address2: '',
              address3: '',
              city: '',
              phone:'',
              postalCode: '',
              contact: '',
              website: '',
              logo: ''
            };
            console.log(companyProfileDto);

            this.companyProfileModel.create(companyProfileDto);
          }

          
        return user;
      })
       
    }

    async updateProfile(user_id, userProfileDto:UserProfileDto):Promise<any>{
      console.log(user_id);
      user_id = new mongoose.Types.ObjectId(user_id);
      //userProfileDto.user_id = user_id;
      const isUser = await this.userProfileModel.findOne({user_id});
      if (!isUser) {
        throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        //console.log(userProfileDto);
        return await this.userProfileModel.findOneAndUpdate({user_id}, userProfileDto)
      }
  }

    async getAllUsers():Promise<User[]>{
        return await this.userModel.find().exec()
    }

    async getUser(user_id):Promise<any>{
      user_id = new mongoose.Types.ObjectId(user_id);
      
      console.log(user_id);
      const isUser = await this.userProfileModel.findOne({user_id});
      console.log(isUser);
      if (!isUser) {
        throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        return await this.userProfileModel.findOne({user_id});
      }
  }
  async updateUserJobs(user_id, userJobsDto:UserJobsDto):Promise<any>{
    console.log(user_id);
    user_id = new mongoose.Types.ObjectId(user_id);
    //userProfileDto.user_id = user_id;
    const isUser = await this.userJobsModel.findOne({user_id});
    if (!isUser) {
      throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
    }else{
      //console.log(userProfileDto);
      return await this.userJobsModel.findOneAndUpdate({user_id}, userJobsDto)
    }
}
}
