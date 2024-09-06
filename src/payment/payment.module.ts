import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';
import { Order, OrderSchema } from 'src/orders/schema/order.schema';
import { CounterSchema } from 'src/utils/Counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
      { name: Order.name, schema: OrderSchema },
      { name: 'Counter', schema: CounterSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [User, CompanyProfile, PaymentService, JwtService]
})
export class PaymentModule { }
