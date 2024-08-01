import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schema/Order.schema';
import { OrderDto } from './dto/Order.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { defaultArgs } from 'puppeteer';

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
    return await this.ordersModel.create(ordersDto);

  }


  async getOrders(companyId, searchTerm: string, skip: number, limit: number) {
    companyId = new Types.ObjectId(companyId);
    let query = new RegExp(searchTerm, 'i')

    const details = await this.ordersModel.aggregate([
      {
        $addFields: {
          invoiceNumberString: { $toString: "$invoiceNumber" },
          amountString: { $toString: "$amount" },
          createdDateString: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$created_date"
            }
          }
        }
      },
      {
        $match: {
          companyId,
          $or: [
            { invoiceNumberString: { $regex: query } },
            { amountString: { $regex: query } },
            { createdDateString: { $regex: query } }
          ]
        }
      },
      { $sort: { created_date: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          count: [{ $count: "total" }]
        }
      }
    ])
    return {
      total: details[0].count[0].total,
      details: details[0].data,
      status: 200
    }
  }

  // async getOrder(orderId): Promise<Order> {
  //   orderId = new mongoose.Types.ObjectId(orderId);

  //   const isOrder = await this.ordersModel.findOne({ _id: orderId });
  //   console.log(isOrder);
  //   if (!isOrder) {
  //     throw new HttpException({ message: "The given Order does not exsit" }, HttpStatus.BAD_REQUEST);
  //   } else {
  //     return await this.ordersModel.findOne({ _id: orderId });
  //   }
  // }



}
