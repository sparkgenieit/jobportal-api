import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema }
    ])
  ],

  controllers: [StripeController],
  providers: [User, StripeService, JwtService]
})
export class StripeModule { }
