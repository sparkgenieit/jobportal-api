import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserProfile } from './schema/userProfile.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserJobsDto } from './dto/user-jobs.dto';
import { UserJobs } from './schema/userJobs.schema';
import { AuthGuard } from 'src/auth/auth.guard';


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
    async UserResetPassword(@Query() { email, token }, @Body() password): Promise<any> {
        return await this.userService.resetPassword(email, token, password)
    }

    @Post('verify-email')
    async VerifyEmail(@Query() { email }): Promise<any> {
        return await this.userService.verifyEmail(email)
    }

    @Post('activate-account')
    async UserActivateAccount(@Query() { email, token }): Promise<any> {
        return await this.userService.activateAccount(email, token)
    }

    @Post('register')
    async createUserDto(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.createUser(createUserDto);
    }
    @UseGuards(AuthGuard)
    @Get("all")
    async getAllUsers(@Query() { role, limit, skip }): Promise<any> {
        return await this.userService.getAllUsers(role, +limit, +skip)
    }
    @UseGuards(AuthGuard)
    @Get("admins/all")
    async getAllAdmins(@Query() { limit, skip }) {
        return await this.userService.getAllAdmins(+limit, +skip)
    }
    @UseGuards(AuthGuard)
    @Put('admin/update/:id')
    async updateAdmin(@Param() data, @Body() userDto: CreateUserDto): Promise<User> {
        return await this.userService.updateAdmin(data.id, userDto);
    }
    @UseGuards(AuthGuard)
    @Get('get-credits/:id')
    async updateUser(@Param() data): Promise<User> {
        return await this.userService.getUserCredits(data.id);
    }


    @UseGuards(AuthGuard)
    @Delete('admin/delete/:id')
    async deleteAdmin(@Param() data): Promise<User> {
        return await this.userService.deleteAdmin(data.id);
    }
    @UseGuards(AuthGuard)
    @Put('profile/update/:id')
    async userProfileDto(@Param() data, @Body() userProfileDto: UserProfileDto): Promise<UserProfile> {
        return await this.userService.updateProfile(data.id, userProfileDto);
    }
    @UseGuards(AuthGuard)
    @Get('profile/:id')
    async getUser(@Param() data): Promise<UserProfile> {
        console.log(data.id);
        return await this.userService.getUser(data.id);
    }
    @UseGuards(AuthGuard)
    @Post('profile/update/:id')
    async userJobsDto(@Param() data, @Body() userJobsDto: UserJobsDto): Promise<UserJobs> {
        return await this.userService.updateUserJobs(data.id, userJobsDto);
    }
}