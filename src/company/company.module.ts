import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './company.service';
import { CompaniesController } from './company.controller';

import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from './schema/companyProfile.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
    ])
  ],
  providers: [CompanyProfile, CompanyService, UserJobs, JwtService],
  controllers: [CompaniesController]
})
export class CompanyModule { }
