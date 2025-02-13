import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './company.service';
import { CompaniesController } from './company.controller';

import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from './schema/companyProfile.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Jobs, JobsSchema } from 'src/jobs/schema/Jobs.schema';
import { Ads, AdsSchema } from 'src/ads/schema/Ads.schema';

import { Recruiter, RecruiterSchema } from './schema/recruiter.schema';
import { Log, LogSchema } from 'src/audit/Log.schema';
import { ProfileChanges, ProfileChangesSchema } from './schema/profileChanges.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Jobs.name, schema: JobsSchema },
      { name: Ads.name, schema: AdsSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: Recruiter.name, schema: RecruiterSchema },
      { name: Log.name, schema: LogSchema },
      { name: ProfileChanges.name, schema: ProfileChangesSchema },
    ])
  ],
  providers: [CompanyService, JwtService],
  controllers: [CompaniesController]
})
export class CompanyModule { }
