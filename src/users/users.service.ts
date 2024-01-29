import { Injectable } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel:Model<User>
    ){}

    async createUser(createUserDto:CreateUserDto):Promise<User>{
        console.log(createUserDto);
        return await this.userModel.create(createUserDto);
    }

    async getAllUsers():Promise<User[]>{
        return await this.userModel.find().exec()
    }
}
