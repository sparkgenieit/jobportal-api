import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfile } from './schema/userProfile.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel:Model<User>,
        @InjectModel(UserProfile.name) private readonly userProfileModel:Model<UserProfile>,
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
        const isUser = await this.userModel.findOne({email});
        if (isUser) {
          throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
        }

      const user =   await this.userModel.create(createUserDto);
      const payload = { username: user.first_name+" "+user.last_name, sub: user._id };
      //user.token  = this.jwtService.sign(payload);
      user.token  = '999';
      //console.log(users);
      const userData = {user_id:null}; 
       this.userModel.create(createUserDto).then((res) => {
          userData.user_id  = res._id;
          this.userProfileModel.create({user_id:userData})
      })
       
      return user;
    }

    async updateProfile(userProfileDto:UserProfileDto):Promise<any>{
      const user_id = userProfileDto.user_id;
      const isUser = await this.userProfileModel.findOne({user_id});
      if (!isUser) {
        throw new HttpException({message: "The given user does not exsit"}, HttpStatus.BAD_REQUEST);
      }else{
        return await this.userProfileModel.updateOne(userProfileDto);
      }
  }

    async getAllUsers():Promise<User[]>{
        return await this.userModel.find().exec()
    }

    async getUser({user_id}):Promise<any>{
      console.log("user", user_id);
      return await this.userProfileModel.findOne({user_id})
  }
}
