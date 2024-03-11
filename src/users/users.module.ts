import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, } from './schema/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserProfile, UserProfileSchema } from './schema/userProfile.schema';
import { UserJobs, UserJobsSchema } from './schema/userJobs.schema';

import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: UserJobs.name, schema: UserJobsSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema }
    ])
  ],
  providers: [User, UserProfile,  UserJobs, UsersService, JwtService],
  controllers: [UsersController]
})
export class UsersModule {}
