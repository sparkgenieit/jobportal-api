import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Res, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserProfile } from './schema/userProfile.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { forgotOrResetPasswordDto } from './dto/forgotOrResetPassword.dto';
import { Roles } from 'src/auth/roles.decorator';
import { updateUserDto } from './dto/updateUser.dto';
import { Response, Request } from 'express';


@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ) { }

    @Post('login')
    async LoginUserDto(@Body(ValidationPipe) loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response): Promise<User> {
        return await this.userService.findOne(loginUserDto, res);
    }

    @Post('/login/recruiter')
    async loginRecruiter(@Body(ValidationPipe) loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
        return await this.userService.recruiterLogin(loginUserDto, res);
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
    async VerifyEmail(@Query() { email }: forgotOrResetPasswordDto): Promise<any> {
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
    @Roles(["superadmin", "admin"])
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
    @Roles(["superadmin"])
    @Put('update/:id')
    async updateUser(@Body(ValidationPipe) updateUser: updateUserDto, @Param() data) {
        return await this.userService.updateUser(updateUser, data.id);
    }

    @UseGuards(AuthGuard)
    @Post("/logout")
    async logoutUser(@Res() res: Response) {
        res.clearCookie("Token")
        res.send({ message: "Logout Successfull" })
    }

    @UseGuards(AuthGuard)
    @Get('/user')
    async getUser(@Req() req: Request) {
        return await this.userService.getUser(req.user);
    }

    @UseGuards(AuthGuard)
    @Roles(["user", "employer", "recruiter"])
    @Get('profile/:id')
    async getUserProfile(@Param() data): Promise<UserProfile> {
        return await this.userService.getUserProfile(data.id);
    }

}