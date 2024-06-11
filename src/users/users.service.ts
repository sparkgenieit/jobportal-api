import { HttpException, HttpStatus, Injectable, Param } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfile } from './schema/userProfile.schema';
import { UserJobsDto } from './dto/user-jobs.dto';
import { UserJobs } from './schema/userJobs.schema';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfileDto } from 'src/company/dto/company-profile.dto';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';
import { UploadController } from 'src/upload/upload.controller';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly uploadController: UploadController,
    private emailService: MailerService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserProfile.name) private readonly userProfileModel: Model<UserProfile>,
    @InjectModel(UserJobs.name) private readonly userJobsModel: Model<UserJobs>,

    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    private jwtService: JwtService
  ) { }

  async findOne({ email, password }: LoginUserDto): Promise<any> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException({ message: 'Invalid email' }, HttpStatus.BAD_REQUEST);
    }
    if (!user.activated) {
      throw new HttpException({ message: 'User Not Activated' }, HttpStatus.BAD_REQUEST);
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException({ message: 'Invalid password' }, HttpStatus.BAD_REQUEST);
    }
    const payload = { username: user.first_name + " " + user.last_name, sub: user._id };
    user.token = await this.jwtService.signAsync(payload, { secret: "JWT_SECRET_KEY" });
    //user.token = '999';
    return user;
  }

  async forgotPassword({ email }): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException({ message: 'No User Found' }, HttpStatus.NOT_FOUND);
    } else {
      let token = randomUUID()
      await this.userModel.findOneAndUpdate({ _id: user._id }, { token: token })

      const promises = [];
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

  async resetPassword(email: string, token: string, { password }): Promise<any> {
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
    const user = await this.userModel.findOneAndUpdate({ email }, { token })
    console.log(user)
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
      return await this.userModel.findOneAndUpdate({ _id: user._id }, { activated: activated, token: token });
    }

  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const email = createUserDto.email;
    const role = createUserDto.role;
    const encryptedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = encryptedPassword;

    const isUser = await this.userModel.findOne({ email });
    if (isUser) {
      throw new HttpException({ message: "The given email " + email + " already exsit" }, HttpStatus.BAD_REQUEST);
    }

    //CreateUserDto.token = '';
    //const user =   await this.userModel.create(createUserDto);
    return await this.userModel.create(createUserDto).then(async (res) => {

      const user = res;
      const payload = { username: res.first_name + " " + res.last_name, sub: res._id };

      user._id = res._id;
      //user.token  = this.jwtService.sign(payload);
      // user.token = '999';
      console.log("role", role);

      if (role == 'user') {
        console.log(createUserDto)
        const userProfileDto: UserProfileDto = { user_id: res._id, first_name: res.first_name, last_name: res.last_name, email: res.email };
        console.log("userr");
        console.log(userProfileDto);
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
          credits:0
        };
        console.log(companyProfileDto);

        this.companyProfileModel.create(companyProfileDto);
      }

      await this.verifyEmail(email)
      return user;
    })

  }

  async updateProfile(user_id, userProfileDto: UserProfileDto): Promise<any> {
    console.log(user_id);
    const encryptedPassword = await bcrypt.hash('kiran123', 10);
    console.log('password', encryptedPassword);
    user_id = new mongoose.Types.ObjectId(user_id);
    //userProfileDto.user_id = user_id;
    const isUser = await this.userProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.NOT_FOUND);
    } else {
      console.log("update");
      console.log(userProfileDto);

      return await this.userProfileModel.findOneAndUpdate({ user_id }, userProfileDto)
    }
  }

  async updateAdmin(user_id, userDto: CreateUserDto): Promise<any> {
    console.log(user_id);
    user_id = new mongoose.Types.ObjectId(user_id);
    //userProfileDto.user_id = user_id;
    const isUser = await this.userModel.findOne({ _id: user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.NOT_FOUND);
    } else {
      console.log("update");
      console.log(userDto);
      const encryptedPassword = await bcrypt.hash(userDto.password, 10);
      userDto.password = encryptedPassword;

      return await this.userModel.findOneAndUpdate({ _id: user_id }, userDto)
    }
  }

  async deleteAdmin(user_id): Promise<any> {
    console.log(user_id);
    user_id = new mongoose.Types.ObjectId(user_id);
    //userProfileDto.user_id = user_id;
    const isUser = await this.userModel.findOne({ _id: user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.NOT_FOUND);
    } else {

      return await this.userModel.deleteOne({ _id: user_id })
    }
  }

  async uploadCv(cv) {
    if (cv) {
      const cvFileName = this.uploadController.uploadFile(cv);
      console.log(cvFileName);
      return cvFileName;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec()
  }

  async getAllAdmins(limit: number, skip: number): Promise<any> {

    const count = await this.userModel.countDocuments({ role: 'admin' }).exec();
    const data = await this.userModel.find({ role: 'admin' }).skip(skip).limit(limit).exec();
    return {
      admins: data,
      total: count,
      status: 200,
    }

  }

  async getUser(user_id): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);

    console.log(user_id);
    const isUser = await this.userProfileModel.findOne({ user_id });
    console.log(isUser);
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.NOT_FOUND);
    } else {
      return await this.userProfileModel.findOne({ user_id });
    }
  }
  async updateUserJobs(user_id, userJobsDto: UserJobsDto): Promise<any> {
    console.log(user_id);
    user_id = new mongoose.Types.ObjectId(user_id);
    //userProfileDto.user_id = user_id;
    const isUser = await this.userJobsModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exsit" }, HttpStatus.NOT_FOUND);
    } else {
      //console.log(userProfileDto);
      return await this.userJobsModel.findOneAndUpdate({ user_id }, userJobsDto)
    }
  }
}
