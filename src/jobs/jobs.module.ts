import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { jobsController } from './jobs.controller';

import { JwtService } from '@nestjs/jwt';
import { Jobs, JobsSchema } from './schema/Jobs.schema';
import { JobsService } from './jobs.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';
import { Order, OrderSchema } from 'src/orders/schema/Order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jobs.name, schema: JobsSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: Order.name, schema: OrderSchema },
    ])
  ],
  providers: [Jobs, JobsService, User, UserJobs, JwtService, CompanyProfile],
  controllers: [jobsController]
})
export class JobsModule { }
