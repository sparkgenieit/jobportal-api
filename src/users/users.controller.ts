import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserProfile } from './schema/userProfile.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { forgotOrResetPasswordDto } from './dto/forgotOrResetPassword.dto';
import { Roles } from 'src/auth/roles.decorator';


@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ) { }

    @Post('login')
    async LoginUserDto(@Body(ValidationPipe) loginUserDto: LoginUserDto): Promise<User> {
        return await this.userService.findOne(loginUserDto);
    }

    @Post('/login/recruiter')
    async loginRecruiter(@Body(ValidationPipe) loginUserDto: LoginUserDto) {
        return await this.userService.recruiterLogin(loginUserDto);
    }

    @Post('forgot-password')
    async UserForgotPassword(@Body(ValidationPipe) { email }: forgotOrResetPasswordDto): Promise<any> {
        return await this.userService.forgotPassword(email);
    }

    @Patch('reset-password')
    async UserResetPassword(@Query() { email, token }, @Body(ValidationPipe) { password }: forgotOrResetPasswordDto): Promise<any> {
        return await this.userService.resetPassword(email, token, password)
    }

    @Post('verify-email')
    async VerifyEmail(@Query(ValidationPipe) { email }: forgotOrResetPasswordDto): Promise<any> {
        return await this.userService.verifyEmail(email)
    }

    @Post('activate-account')
    async UserActivateAccount(@Query() { email, token }): Promise<any> {
        return await this.userService.activateAccount(email, token)
    }

    @Post('register')
    async createUserDto(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.createUser(createUserDto);
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("all")
    async getAllUsers(@Query() { role, limit, skip }): Promise<any> {
        return await this.userService.getAllUsers(role, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("admins/all")
    async getAllAdmins(@Query() { limit, skip }) {
        return await this.userService.getAllAdmins(+limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Put('admin/update/:id')
    async updateAdmin(@Param() data, @Body(ValidationPipe) userDto: CreateUserDto): Promise<User> {
        return await this.userService.updateAdmin(data.id, userDto);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Get('get-saved-jobs/:id')
    async getSavedJobs(@Param() data) {
        return await this.userService.getSavedJobsIDs(data.id);
    }

    @UseGuards(AuthGuard)
    @Roles(["employer"])
    @Get('get-credits/:id')
    async updateUser(@Param() data): Promise<User> {
        return await this.userService.getUserCredits(data.id);
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Delete('admin/delete/:id')
    async deleteAdmin(@Param() data): Promise<User> {
        return await this.userService.deleteAdmin(data.id);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Put('profile/update/:id')
    async userProfileDto(@Param() data, @Body() userProfileDto: UserProfileDto): Promise<UserProfile> {
        return await this.userService.updateProfile(data.id, userProfileDto);
    }

    @UseGuards(AuthGuard)
    @Roles(["user", "employer", "recruiter"])
    @Get('profile/:id')
    async getUser(@Param() data): Promise<UserProfile> {
        console.log(data.id);
        return await this.userService.getUser(data.id);
    }
}