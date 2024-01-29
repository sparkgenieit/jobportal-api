import { UsersService } from './users.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';


@Controller('users')
export class UsersController {
    constructor(
        private readonly userService:UsersService
    ){}

    @Post('user')
    async createUserDto(@Body() createUserDto:CreateUserDto):Promise<User>{
        return await this.userService.createUser(createUserDto);
    }

    @Get("users/all")
    async getAllUsers():Promise<User[]>{
        return await this.userService.getAllUsers()
    }
}
