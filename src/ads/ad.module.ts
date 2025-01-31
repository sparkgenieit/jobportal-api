import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdController } from './ad.controller';

import { JwtService } from '@nestjs/jwt';
import { Ad, AdSchema } from './schema/Ad.schema';
import { AdService } from './ad.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';
import { Log, LogSchema } from 'src/audit/Log.schema';
import { AdminLog, AdminLogSchema } from 'src/audit/AdminLog.Schema';
import { LogService } from 'src/audit/logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ad.name, schema: AdSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: Log.name, schema: LogSchema },
      { name: AdminLog.name, schema: AdminLogSchema },
    ])
  ],
  providers: [Ad, AdService, User, UserJobs,LogService,  JwtService],
  controllers: [AdController]
})
export class AdModule { }
