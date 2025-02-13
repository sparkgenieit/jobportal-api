import { HttpException, HttpStatus, Injectable, Param } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfile } from './schema/userProfile.schema';
import { UserJobs } from './schema/userJobs.schema';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfileDto, CompanyProfileStatus } from 'src/company/dto/company-profile.dto';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';
import { UploadController } from 'src/upload/upload.controller';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { randomUUID } from 'crypto';
import { Recruiter } from 'src/company/schema/recruiter.schema';
import { updateUserDto } from './dto/updateUser.dto';
import { Response } from 'express';
import { Log } from 'src/audit/Log.schema';
import { AdminLog } from 'src/audit/AdminLog.Schema';
import { LogService } from 'src/audit/logs.service';
import { ENV } from 'src/utils/functions';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    private readonly uploadController: UploadController,
    private emailService: MailerService,
    private logService: LogService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserProfile.name) private readonly userProfileModel: Model<UserProfile>,
    @InjectModel(Recruiter.name) private readonly recruiterModel: Model<Recruiter>,
    @InjectModel(UserJobs.name) private readonly userJobsModel: Model<UserJobs>,
    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    private jwtService: JwtService
  ) { }

  async findOne({ email, password }: LoginUserDto, res: Response): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException({ message: 'User does not exist' }, HttpStatus.NOT_FOUND);
    }
    if (!user.activated) {
      throw new HttpException({ message: 'User Not Activated' }, HttpStatus.BAD_REQUEST);
    }

    if (user.blocked) {
      throw new HttpException({ message: 'You are blocked from using our services' }, HttpStatus.FORBIDDEN);
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException({ message: 'Invalid password' }, HttpStatus.BAD_REQUEST);
    }
    const payload = { username: user.first_name + " " + user.last_name, id: user._id, role: user.role, email: user.email };
    const token = await this.jwtService.signAsync(payload, { secret: ENV.JWT_SECRET_KEY });

    let userObject = user.toObject()

    const { password: pass, ...results } = userObject  // Should not send password string to the client

    if (user.role === "employer" || user.role === "user") {  // Log to create in normal logs when user or an employer is logged in 
      const log: Log = {
        user_id: user._id.toString(),
        name: payload.username,
        username: payload.username,
        email: user.email,
        description: `${user.role} Login`,
        fieldName: "Login"
      }

      await this.logService.createLog(log)
    }
    else { // create the log in admin logs if admin or superadmin is logged in
      const log: AdminLog = {
        admin_id: user._id.toString(),
        name: payload.username,
        email: user.email,
        description: `${user.role} Login`,
        fieldName: "Login"

      }
      await this.logService.createAdminLog(log)
    }

    res.cookie('Token', token, { httpOnly: true, sameSite: 'strict', maxAge: 3 * 24 * 60 * 60 * 1000 }) // Cookie will expire after 3 days
    res.json(results)
  }

  async recruiterLogin({ email, password }: LoginUserDto, res: Response): Promise<any> {
    const recruiter: any = await this.recruiterModel.findOne({ email }).populate("companyId", { password: 0, activated: 0, token: 0, role: 0 })

    if (!recruiter) {
      throw new HttpException({ message: 'Recruiter does not exist' }, HttpStatus.NOT_FOUND);
    }

    const isMatch: boolean = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      throw new HttpException({ message: 'Invalid password' }, HttpStatus.BAD_REQUEST);
    }

    const payload = { username: recruiter.name, id: recruiter._id, role: "recruiter", email: recruiter.email, companyId: recruiter.companyId._id };
    const token = await this.jwtService.signAsync(payload, { secret: ENV.JWT_SECRET_KEY });

    const { password: pass, ...results } = recruiter.toObject()

    const user = { ...results, role: "recruiter" }

    const log: Log = {
      user_id: user._id.toString(),
      name: recruiter.companyId.first_name + " " + recruiter.companyId.last_name,
      username: payload.username,
      email: user.email,
      description: `Recruiter Login`,
      fieldName: "Login"
    }

    await this.logService.createLog(log)

    res.cookie('Token', token, { httpOnly: true, sameSite: 'strict', maxAge: 3 * 24 * 60 * 60 * 1000 })
    res.send(user)
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException({ message: 'No User Found' }, HttpStatus.NOT_FOUND);
    } else {
      let token = randomUUID()
      await this.userModel.findOneAndUpdate({ _id: user._id }, { token: token })

      await this.emailService.sendMail({
        to: user.email,
        subject: `[${process.env.APP_NAME}] Email Confirmation`,
        // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        template: 'user/reset_password',
        context: {
          name: `${user.first_name} ${user.last_name}`,
          url: `http://localhost:3000/reset-password?email=${user.email}&token=${token}`,
        },
      });
      return { status: 200 }
    }
  }

  async resetPassword(email: string, token: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException({ message: 'No User Found' }, HttpStatus.NOT_FOUND);
    } else {
      if ((user.token).trim() !== "" && user.token === token) {
        const encryptedPassword = await bcrypt.hash(password, 10);
        password = encryptedPassword;
        token = "";
        return await this.userModel.findOneAndUpdate({ _id: user._id }, { password, token })
      }
      else {
        throw new HttpException({ message: "You can't change the password" }, HttpStatus.UNAUTHORIZED);
      }

    }
  }

  async verifyEmail(email: string) {
    const token = randomUUID()
    const user = await this.userModel.findOneAndUpdate({ email }, { token }, { new: true })

    if (!user) throw new HttpException({ message: 'No User Found' }, HttpStatus.NOT_FOUND);

    await this.emailService.sendMail({
      to: email,
      subject: `[${process.env.APP_NAME}] Email Confirmation`,
      // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
      template: 'user/user_welcome',
      context: {
        name: `${user.first_name} ${user.last_name}`,
        url: `http://localhost:3000/activate-account?email=${email}&token=${token}`,

      },
    });
    return { status: 200 }
  }

  async activateAccount(email: string, token: string): Promise<any> {

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException({ message: 'No User Found' }, HttpStatus.NOT_FOUND);
    }
    else if (user.token !== token) {
      throw new HttpException({ message: `Can't Activate the Account` }, HttpStatus.NOT_FOUND);
    } else {
      const activated = true;
      const token = "";
      return await this.userModel.findOneAndUpdate({ _id: user._id }, { activated, token });
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const email = createUserDto.email;
    const role = createUserDto.role;
    const encryptedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = encryptedPassword;
    createUserDto.job_credits = 0;
    createUserDto.ad_credits = 0;

    createUserDto.usedFreeCredit = false;


    const isUser = await this.userModel.findOne({ email });
    if (isUser) {
      throw new HttpException({ message: "The given email " + email + " already exist" }, HttpStatus.BAD_REQUEST);
    }

    return await this.userModel.create(createUserDto)
      .then(async (res) => {

        const user = res;
        const payload = { username: res.first_name + " " + res.last_name, sub: res._id };
        user._id = res._id;

        if (role == 'user') {
          console.log(createUserDto)
          const userProfileDto: UserProfileDto = { user_id: res._id, first_name: res.first_name, last_name: res.last_name, email: res.email };
          this.userProfileModel.create(userProfileDto);
        }

        if (role == 'employer') {
          const companyProfileDto: CompanyProfileDto = {
            user_id: res._id,
            email: res.email,
            name: createUserDto.first_name + " " + createUserDto.last_name,
            address1: '',
            address2: '',
            address3: '',
            city: '',
            phone: '',
            postalCode: '',
            contact: '',
            website: '',
            logo: '',
            status: CompanyProfileStatus.APPROVED
          };
          this.companyProfileModel.create(companyProfileDto);
        }
        await this.verifyEmail(email)
        return user;
      })

  }

  async updateProfile(user_id: string | Types.ObjectId, userProfileDto: UserProfileDto): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.userProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    } else {
      await this.userModel.findOneAndUpdate({ _id: user_id }, { first_name: userProfileDto.first_name, last_name: userProfileDto.last_name })
      return await this.userProfileModel.findOneAndUpdate({ user_id }, userProfileDto)
    }
  }

  async updateAdmin(user_id: string | Types.ObjectId, userDto: CreateUserDto): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.userModel.findOne({ _id: user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    } else {
      const encryptedPassword = await bcrypt.hash(userDto.password, 10);
      userDto.password = encryptedPassword;
      return await this.userModel.findOneAndUpdate({ _id: user_id }, userDto)
    }
  }

  async deleteAdmin(user_id: string | Types.ObjectId): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);
    //userProfileDto.user_id = user_id;
    const isUser = await this.userModel.findOne({ _id: user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    } else {
      return await this.userModel.deleteOne({ _id: user_id })
    }
  }

  async updateUser(userData: updateUserDto, id: Types.ObjectId | string) {
    id = new Types.ObjectId(id)
    const user = await this.userModel.findById(id)
    if (!user) throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    await this.userModel.findOneAndUpdate({ _id: id }, userData)
    return { message: "Update Success" }
  }


  async getAllUsers(role: string, limit: number, skip: number): Promise<any> {
    const users = await this.userModel.aggregate([
      {
        $facet: {
          data: [{
            $match: { role }
          },
          { $skip: skip },
          { $limit: limit }
          ],
          count: [{ $match: { role } }, { $count: "total" }]
        }
      }
    ])

    return {
      users: users[0].data,
      total: users[0].count[0]?.total || 0,
      status: 200
    }
  }

  async getAllAdmins(limit: number, skip: number): Promise<any> {
    const query = {
      $or: [
        { role: "admin" },
        { role: "superadmin" },
      ]
    }
    const users = await this.userModel.aggregate([
      {
        $facet: {
          data: [{
            $match: query
          },
          { $skip: skip },
          { $limit: limit }
          ],
          count: [{ $match: query }, { $count: "total" }]
        }
      }
    ])

    return {
      admins: users[0].data,
      total: users[0].count[0]?.total || 0,
      status: 200
    }
  }

  async getSavedJobsIDs(id: string | Types.ObjectId) {
    id = new Types.ObjectId(id)
    const savedJobsIds = await this.userJobsModel.find({ userId: id }, { jobId: 1, _id: 0 })
    return savedJobsIds
  }

  async getUserProfile(user_id): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.userProfileModel.findOne({ user_id });

    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    } else {
      return await this.userProfileModel.findOne({ user_id });
    }
  }

  async getUser(user: any) {
    const _id = new Types.ObjectId(user.id)
    let currentUser: any;
    if (user.role === "recruiter") {
      currentUser = await this.recruiterModel.findOne({ _id }, { password: 0 }).populate("companyId", { password: 0, activated: 0, token: 0, role: 0 })
      return { ...currentUser.toObject(), role: "recruiter" }
    } else {
      currentUser = await this.userModel.findOne({ _id }, { password: 0 })
      return currentUser
    }
  }

  @OnEvent('user.block')
  async blockUser(user_id: string | Types.ObjectId) {
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.userModel.findOne({ _id: user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    } else {
      return await this.userModel.findOneAndUpdate({ _id: user_id }, { blocked: true })
    }
  }
}
