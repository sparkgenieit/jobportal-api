import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserProfile } from './schema/userProfile.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserJobsDto } from './dto/user-jobs.dto';
import { UserJobs } from './schema/userJobs.schema';


@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ) { }


    @Post('login')
    async LoginUserDto(@Body() loginUserDto: LoginUserDto): Promise<User> {
        return await this.userService.findOne(loginUserDto);
    }

    @Post('forgot-password')
    async UserForgotPassword(@Body() email): Promise<any> {
        return await this.userService.forgotPassword(email);
    }

    @Patch('reset-password')
    async UserResetPassword(@Param() data, @Body() password): Promise<any> {
        return await this.userService.resetPassword(data.email, password)
    }

    @Post('register')
    async createUserDto(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.createUser(createUserDto);
    }

    @Get("all")
    async getAllUsers(): Promise<User[]> {
        return await this.userService.getAllUsers()
    }

    @Get("admins/all")
    async getAllAdmins(@Query() { limit, skip }) {
        return await this.userService.getAllAdmins(+limit, +skip)
    }

    @Put('admin/update/:id')
    async updateAdmin(@Param() data, @Body() userDto: CreateUserDto): Promise<User> {
        return await this.userService.updateAdmin(data.id, userDto);
    }

    @Delete('admin/delete/:id')
    async deleteAdmin(@Param() data): Promise<User> {
        return await this.userService.deleteAdmin(data.id);
    }

    @Put('profile/update/:id')
    async userProfileDto(@Param() data, @Body() userProfileDto: UserProfileDto): Promise<UserProfile> {
        return await this.userService.updateProfile(data.id, userProfileDto);
    }

    @Get('profile/:id')
    async getUser(@Param() data): Promise<UserProfile> {
        console.log(data.id);
        return await this.userService.getUser(data.id);
    }

    @Post('profile/update/:id')
    async userJobsDto(@Param() data, @Body() userJobsDto: UserJobsDto): Promise<UserJobs> {
        return await this.userService.updateUserJobs(data.id, userJobsDto);
    }
}