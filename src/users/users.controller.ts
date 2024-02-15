import { UsersService } from './users.service';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserProfile } from './schema/userProfile.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';


@Controller('users')
export class UsersController {
    constructor(
        private readonly userService:UsersService
    ){}


    @Post('login')
    async LoginUserDto(@Body() loginUserDto:LoginUserDto):Promise<User>{
        return await this.userService.findOne(loginUserDto);
    }

    @Post('register')
    async createUserDto(@Body() createUserDto:CreateUserDto):Promise<User>{
        return await this.userService.createUser(createUserDto);
    }

    @Get("all")
    async getAllUsers():Promise<User[]>{
        return await this.userService.getAllUsers()
    }

    @Put('profile/update/:id')
    async userProfileDto(@Param() data, @Body() userProfileDto:UserProfileDto):Promise<UserProfile>{
        return await this.userService.updateProfile(data.id, userProfileDto);
    }

    @Get('profile/:id')
     async getUser(@Param() data):Promise<UserProfile>{
        console.log(data.id);
        return await this.userService.getUser(data.id);
    }
}
