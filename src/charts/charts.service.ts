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

    const postedJobsByYear = [
      {
        $match: {
          creationdate: {
            $gte: new Date(endDate.getFullYear(), 0, 1),
            $lte: endDate
          }
        }
      },
      {
        $count: "count"
      }
    ]

    const postedJobsByMonth = [
      {
        $match: {
          creationdate: {
            $gte: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
            $lte: endDate
          }
        }
      },
      {
        $count: "count"
      }
    ]

    const posted_jobs = [
      {
        $match: {
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

    const avgViews = [
      {
        $match: {
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
          count: { $avg: "$views" }
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

    const activeJobs = [
      {
        $match: {
          status: "approved"
        }
      },
      {
        $count: "count"
      }
    ]

    const avgJobsByYear = [
      {
        $match: {
          creationdate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: 'userjobs',
          localField: '_id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $match: {
          'applications.applied': true
        }
      },
      {
        $addFields: {
          applicationCount: { $size: '$applications' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$creationdate" },
            month: { $month: "$creationdate" }
          },
          count: { $sum: 1 },
          totalApplications: { $sum: '$applicationCount' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          totalApplications: 1
        }
      }
    ];


    const data = await this.jobsModel.aggregate([
      {
        $match: {
          companyId: company_id
        }
      },
      {
        $facet: {
          posted_jobs,
          avgViews,
          activeJobs,
          postedJobsByYear,
          postedJobsByMonth,
          avgJobsByYear,
        }
      }
    ])


    console.log(data[0]?.avgJobsByYear);

    return {
      posted_jobs: data[0]?.posted_jobs,
      avgViews: data[0]?.avgViews,
      activeJobs: data[0]?.activeJobs[0]?.count,
      postedJobsByYear: data[0]?.postedJobsByYear[0]?.count,
      postedJobsByMonth: data[0]?.postedJobsByMonth[0]?.count,
      avgJobsByYear: data[0]?.avgJobsByYear,
    }
  }
}
