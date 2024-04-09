import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';

import { JwtService } from '@nestjs/jwt';
import { Order, OrderSchema } from './schema/Order.schema';
import { OrderService } from './order.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema }
    ])
  ],
  providers: [Order, OrderService, User, UserJobs, JwtService],
  controllers: [OrderController]
})
export class OrderModule { }
