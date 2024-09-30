import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './company.service';
import { CompaniesController } from './company.controller';

import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from './schema/companyProfile.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Jobs, JobsSchema } from 'src/jobs/schema/Jobs.schema';
import { Recruiter, RecruiterSchema } from './schema/recruiter.schema';
import { Log, LogSchema } from 'src/utils/Log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Jobs.name, schema: JobsSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: Recruiter.name, schema: RecruiterSchema },
      { name: Log.name, schema: LogSchema },
    ])
  ],
  providers: [CompanyProfile, CompanyService, User, Jobs, UserJobs, Recruiter, JwtService],
  controllers: [CompaniesController]
})
export class CompanyModule { }
