import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, } from './schema/user.schema';
import { UsersService } from './company.service';
import { UsersController } from './company.controller';
import { UserProfile, UserProfileSchema } from './schema/userProfile.schema';

import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      { name: UserProfile.name, schema: UserProfileSchema }
    ])
  ],
  providers: [User, UserProfile, UsersService, JwtService],
  controllers: [UsersController]
})
export class UsersModule {}
