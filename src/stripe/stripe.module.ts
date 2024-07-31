import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';
import { OrderService } from 'src/orders/order.service';
import { Order, OrderSchema } from 'src/orders/schema/Order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],

  controllers: [StripeController],
  providers: [User, CompanyProfile, StripeService, JwtService]
})
export class StripeModule { }
