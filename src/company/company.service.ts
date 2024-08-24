import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile } from './schema/companyProfile.schema';
import { CompanyProfileDto } from './dto/company-profile.dto';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { Jobs } from 'src/jobs/schema/Jobs.schema';
import { User } from 'src/users/schema/user.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async checkPreviousPhotoExistence(photoPath) {
    try {
      await fs.promises.access(photoPath, fs.promises.constants.F_OK); // Check for file existence
      return true;
    } catch (err) {
      return false; // File not found or other error
    }
  }

  async updateProfile(user_id, companyProfileDto: CompanyProfileDto): Promise<any> {
    console.log(user_id);
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.companyProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      await this.companyProfileModel.findOneAndUpdate({ user_id }, companyProfileDto);
      if (isUser.name !== companyProfileDto.name) { // checking if the user name is changed or not
        const name = companyProfileDto.name.split(" ")  // Updating the name in Users Collection
        let [first_name, ...lastName] = name;
        let last_name = lastName.join(" ");
        await this.UserModel.findOneAndUpdate({ _id: user_id }, { first_name, last_name });
      }

      if (companyProfileDto.logo) { // checking if logo is changed or not 
        if (isUser.logo !== "") { // deleting the previous logo if the user is updating the existing logo
          const filePath = path.join(__dirname, '..', '..', "public", "uploads", "logos", isUser.logo);
          const photoExists = await this.checkPreviousPhotoExistence(filePath)
          if (photoExists) {
            await fs.promises.unlink(filePath);
          }
        }
        // Updating the logo in all the jobs posted by the company
        await this.jobsModel.updateMany({ companyId: user_id.toString() }, { companyLogo: companyProfileDto.logo });
      }

      if (companyProfileDto.banner) { // checking if Banner is changed or not 
        if (isUser.banner !== "") { // deleting the previous Banner if the user is updating the existing Banner
          const filePath = path.join(__dirname, '..', '..', "public", "uploads", "banners", isUser.banner);
          const photoExists = await this.checkPreviousPhotoExistence(filePath)
          if (photoExists) {
            await fs.promises.unlink(filePath);
          }
        }
      }
      return { message: "Update Success" }
    }
  }

  async getAllCompanies(): Promise<CompanyProfile[]> {
    return await this.companyProfileModel.find().exec()
  }

  async getCompany(user_id): Promise<any> {
    user_id = new mongoose.Types.ObjectId(user_id);
    const isUser = await this.companyProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.companyProfileModel.findOne({ user_id });
    }
  }

  async getAppliedUsersCount(jobId) {
    jobId = new mongoose.Types.ObjectId(jobId);
    let applied = await this.UserJobsModel.countDocuments({ jobId: jobId, applied: true });
    let shortlisted = await this.UserJobsModel.countDocuments({ jobId: jobId, applied: true, shortlisted: true });
    return { applied, shortlisted }
  }

  async getPostedJobs(companyId: string, limit: number, skip: number, name: string) {
    let query: any = {
      companyId,
    }
    if (name && name.trim() !== "") {
      query.$or = [{ jobTitle: { $regex: name, $options: 'i' } }, { employjobreference: { $regex: name, $options: 'i' } }]
    }

    const response = await this.jobsModel.aggregate([
      {
        $facet: {
          data: [{
            $match: query
          },
          {
            $lookup: {
              from: 'userjobs',
              localField: '_id',
              foreignField: 'jobId',
              as: 'appliedUsers'
            }
          },
          {
            $addFields: {
              sortPriority: {
                $switch: {
                  branches: [
                    {
                      'case': { $eq: ['$status', 'rejected'] },
                      then: 0
                    },
                    {
                      'case': { $eq: ['$status', 'approved'] },
                      then: 3
                    },
                    {
                      'case': { $eq: ['$status', 'closed'] },
                      then: 4
                    },
                    {
                      'case': { $eq: ['$status', 'expired'] },
                      then: 5
                    },
                  ],
                  'default': 2
                }
              },
              appliedUsers: { $size: "$appliedUsers" },
              shortlistedUsers: {
                $size: {
                  $filter: {
                    input: '$appliedUsers',
                    as: "users",
                    cond: { $eq: ['$$users.shortlisted', true] }
                  }
                }
              }
            },
          }, {
            $sort: {
              sortPriority: 1,
              creationdate: - 1,
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }

          ],
          count: [{ $match: query }, { $count: 'total' }]
        }
      }
    ])

    return {
      total: response[0]?.count[0]?.total,
      jobs: response[0]?.data,
      status: 200,
    }
  }

  async getAppliedUsers(jobId: Types.ObjectId, shortlisted, limit: number, skip: number) {
    let query: any = {
      jobId,
      applied: true
    }

    if (shortlisted === "true") query.shortlisted = true

    let count = await this.UserJobsModel.countDocuments({ jobId: jobId, applied: true });
    let users = await this.UserJobsModel.find(query).sort({ shortlisted: -1, applied_date: - 1 }).limit(limit).skip(skip).populate('userId').populate("jobId", "jobTitle");
    return {
      users: users,
      total: count,
      status: 200
    }
  }


  async shortListCandidate(jobId: Types.ObjectId, userId: Types.ObjectId, value: Boolean) {

    await this.UserJobsModel.findOneAndUpdate({ jobId, userId }, { shortlisted: value })

    return { message: value ? "Candidate Shortlisted" : "Candidate removed from the Shortlist" }
  }
}
