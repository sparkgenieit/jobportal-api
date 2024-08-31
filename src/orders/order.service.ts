import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schema/order.schema';
import { OrderDto } from './dto/order.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async getOrders(companyId: string | Types.ObjectId, searchTerm: string, sort: string, skip: number, limit: number) {
    companyId = new Types.ObjectId(companyId);
    let query = new RegExp(searchTerm, 'i')
    let sortingOrder: any = sort === "desc" ? { created_date: -1 } : { created_date: 1 }

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
            { $sort: sortingOrder },
            { $skip: skip },
            { $limit: limit }
          ],
          count: [{ $count: "total" }]
        }
      }
    ])
    return {
      total: details[0]?.count[0]?.total,
      details: details[0]?.data,
      status: 200
    }
  }

  async getAllCompanyOrders(companyId: string | Types.ObjectId, from: string, to: string) {
    companyId = new Types.ObjectId(companyId);

    let query: any = {
      companyId
    }

    if (from && to) {
      let fromDate = new Date(from)
      let toDate = new Date(to)

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      query.created_date = {
        $gte: fromDate,
        $lte: toDate
      }
    }
    return await this.ordersModel.find(query).sort({ created_date: -1 })
  }

  async getAllOrders(search: string, limit: number, skip: number) {
    const data = await this.ordersModel.aggregate([{

      $facet: {
        orders: [
          {
            $lookup: {
              from: 'companyprofiles',
              localField: 'companyId',
              foreignField: 'user_id',
              as: 'companyName'
            }
          },
          {
            $addFields: {
              companyName: { $arrayElemAt: ['$companyName.name', 0] }
            }
          },
          { $sort: { created_date: -1 } }
        ]
      }
    }
    ])
    return data[0].orders
  }


  async refundCredits(creditsToRefund: number) {
    try {
      const companies = await this.ordersModel.aggregate([
        {
          $match: {
            invoiceNumber: { $exists: true }
          },
        },
        {
          $group: {
            _id: '$companyId',
          }
        }
      ])

      const companyId = companies.map(company => (company._id))

      await this.userModel.updateMany({ _id: { $in: companyId } }, { $inc: { credits: creditsToRefund } })

      const updatedCredits = await this.userModel.find({ _id: { $in: companyId } }, { credits: 1 })

      const creatingOrders: OrderDto[] = updatedCredits.map(company => ({
        created_date: new Date(),
        companyId: company._id,
        description: "Credit Refund",
        amount: 0,
        creditsPurchased: creditsToRefund,
        credits: company.credits
      }))
      await this.ordersModel.insertMany(creatingOrders, { ordered: false })

    } catch (error) {
      throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

