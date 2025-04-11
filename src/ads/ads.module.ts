import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsController } from './ads.controller';

import { JwtService } from '@nestjs/jwt';
import { Ads, AdsSchema } from './schema/Ads.schema';
import { AdminAds, AdminAdsSchema } from './schema/Admin-ads.schema';
import { AdsService } from './ads.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { AdLog, AdLogSchema } from 'src/audit/AdLog.schema';
import { Log, LogSchema } from 'src/audit/Log.schema';

import { AdminLog, AdminLogSchema } from 'src/audit/AdminLog.Schema';
import { LogService } from 'src/audit/logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ads.name, schema: AdsSchema },
      { name: AdminAds.name, schema: AdminAdsSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: AdLog.name, schema: AdLogSchema },
      { name: Log.name, schema: LogSchema },
      
      { name: AdminLog.name, schema: AdminLogSchema },
    ])
  ],
  providers: [Ads, AdminAds, AdsService, User, UserJobs,LogService,  JwtService],
  controllers: [AdsController]
})
export class AdModule { }
