import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { jobsController } from './jobs.controller';

import { JwtService } from '@nestjs/jwt';
import { Jobs, JobsSchema } from './schema/Jobs.schema';
import { JobsService } from './jobs.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';
import { Log, LogSchema } from 'src/audit/Log.schema';
import { AdLog, AdLogSchema } from 'src/audit/AdLog.schema';
import { AdminLog, AdminLogSchema } from 'src/audit/AdminLog.schema';
import { LogService } from 'src/audit/logs.service';
import { ChartsController } from 'src/charts/charts.controller';
import { ChartsService } from 'src/charts/charts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jobs.name, schema: JobsSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: Log.name, schema: LogSchema },
      { name: AdLog.name, schema: AdLogSchema },

      { name: AdminLog.name, schema: AdminLogSchema },
    ]),
  ],
  providers: [JobsService, JwtService, LogService, ChartsService],
  controllers: [jobsController, ChartsController]
})
export class JobsModule { }
