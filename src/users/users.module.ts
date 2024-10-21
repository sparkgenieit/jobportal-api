import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, } from './schema/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserProfile, UserProfileSchema } from './schema/userProfile.schema';
import { UserJobs, UserJobsSchema } from './schema/userJobs.schema';

import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';
import { UploadController } from 'src/upload/upload.controller';
import { Recruiter, RecruiterSchema } from 'src/company/schema/recruiter.schema';
import { AdminLog, AdminLogSchema } from 'src/audit/AdminLog.Schema';
import { Log, LogSchema } from 'src/audit/Log.schema';
import { LogService } from 'src/audit/logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: Recruiter.name, schema: RecruiterSchema },
      { name: Log.name, schema: LogSchema },
      { name: AdminLog.name, schema: AdminLogSchema },
    ]),
  ],
  providers: [UploadController, LogService, UsersService, JwtService],
  controllers: [UsersController]
})
export class UsersModule { }
