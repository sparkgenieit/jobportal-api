import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Order } from './schema/Order.schema';
import { OrderDto } from './dto/Order.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { UserJobsDto } from 'src/users/dto/user-jobs.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async createOrder(ordersDto: OrderDto): Promise<any> {
    // const isJob = await this.userModel.findOne({email});
    // if (isUser) {
    //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
    // }

    //CreateUserDto.token = '';
    ordersDto.paymentStatus = 'active';
    return await this.ordersModel.create(ordersDto);

  }

  async updateOrder(orderId, ordersDto: OrderDto): Promise<any> {
    const isOrder = await this.ordersModel.findOne({ orderId });
    if (!isOrder) {
      throw new HttpException({ message: "The given Order does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.ordersModel.findOneAndUpdate({ _id: orderId }, ordersDto);
    }
  }

  async getOrders(): Promise<Order[]> {
    return await this.ordersModel.find().exec()
  }

  async getOrder(orderId): Promise<any> {
    orderId = new mongoose.Types.ObjectId(orderId);

    const isOrder = await this.ordersModel.findOne({ _id: orderId });
    console.log(isOrder);
    if (!isOrder) {
      throw new HttpException({ message: "The given Order does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.ordersModel.findOne({ _id: orderId });
    }
  }

  
  async deleteOrder(orderId): Promise<any> {
    console.log(orderId);
    orderId = new mongoose.Types.ObjectId(orderId);
    //userProfileDto.user_id = user_id;
    const isOrder = await this.ordersModel.findOne({ _id:orderId });
    if (!isOrder) {
      throw new HttpException({ message: "The given Order does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
     
      return await this.userModel.deleteOne({ orderId })
    }
  }
}
