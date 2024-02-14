// import { UsersService } from './company.service';
// import { Body, Controller, Get, Post } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { User } from './schema/user.schema';
// import { LoginUserDto } from './dto/login-user.dto';
// import { UserProfileDto } from './dto/user-profile.dto';


// @Controller('users')
// export class UsersController {
//     constructor(
//         private readonly userService:UsersService
//     ){}


//     @Post('login')
//     async LoginUserDto(@Body() loginUserDto:LoginUserDto):Promise<User>{
//         return await this.userService.findOne(loginUserDto);
//     }

//     @Post('register')
//     async createUserDto(@Body() createUserDto:CreateUserDto):Promise<User>{
//         return await this.userService.createUser(createUserDto);
//     }

//     @Get("all")
//     async getAllUsers():Promise<User[]>{
//         return await this.userService.getAllUsers()
//     }

//     @Post('profile/update')
//     async userProfileDto(@Body() userProfileDto:UserProfileDto):Promise<User>{
//         return await this.userService.updateProfile(userProfileDto);
//     }

//     @Post('profile/:id')
//      async getUser(id):Promise<User[]>{
//         return await this.userService.getUser(id);
//     }
// }
