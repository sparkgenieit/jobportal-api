import { UsersService } from './users.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
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

    @Post('profile/update')
    async userProfileDto(@Body() userProfileDto:UserProfileDto):Promise<User>{
        return await this.userService.updateProfile(userProfileDto);
    }

    @Get('profile/:id')
     async getUser(@Param() data):Promise<User[]>{
        console.log(data.id);
        return await this.userService.getUser(data.id);
    }
}
