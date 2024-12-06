import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Jobs } from "src/jobs/schema/Jobs.schema";

@Injectable()
export class ChartsService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
  ) { }

  async getCompanyChartsData(company_id: string) {

    const endDate = new Date()

    const lastYear = endDate.getFullYear() - 1

    const startDate = new Date(lastYear, 0, 1)

    const posted_jobs =
      [
        {
          $match: {
            companyId: company_id,
            creationdate: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$creationdate" },
              month: { $month: "$creationdate" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1
          }
        }
      ]


    const data = await this.jobsModel.aggregate([
      {
        $facet: {
          posted_jobs
        }
      }
    ])

    return {
      posted_jobs: data[0]?.posted_jobs
    }
  }
}
