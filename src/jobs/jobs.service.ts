import { HttpException, HttpStatus, Injectable, OnModuleInit, Search } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Jobs } from './schema/Jobs.schema';
import { JobsDto } from './dto/jobs.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { skip } from 'node:test';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';
import { Cron } from '@nestjs/schedule';


@Injectable()
export class JobsService implements OnModuleInit {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async onModuleInit() {
    this.checkExpiredJobs()
  }

  async createJob(jobsDto: JobsDto): Promise<any> {
    // const isJob = await this.userModel.findOne({email});
    // if (isUser) {
    //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
    // }

    //CreateUserDto.token = '';
    let user = await this.userModel.findOne({ _id: jobsDto.companyId })
    if (user.usedFreeCredit === false) {
      jobsDto.status = 'queue';
      await this.userModel.findOneAndUpdate({ _id: jobsDto.companyId }, { usedFreeCredit: true });
      await this.jobsModel.create(jobsDto);
      return ({ message: "Job Posted" })

    }
    if (user.credits > 0) {
      jobsDto.status = 'queue';
      let credits = user.credits - 1;
      await this.userModel.findOneAndUpdate({ _id: jobsDto.companyId }, { credits: credits });
      await this.jobsModel.create(jobsDto);
      return ({ message: "Job Posted", credits: credits })
    }
    if (user.usedFreeCredit === true && user.credits == 0) {
      throw new HttpException({ message: "Not Enough Credits, Can't Post this Job" }, HttpStatus.BAD_REQUEST);
    }
  }

  async updateJob(jobId, jobsDto: JobsDto): Promise<any> {
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.status = 'queue';
      jobsDto.adminId = null;
      jobsDto.adminName = "";
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async assignJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exist" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.status = 'review';
      jobsDto.adminName = isUser.first_name + " " + isUser.last_name;
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async releaseJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);

    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exist" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = "";
      jobsDto.adminName = "";
      jobsDto.status = 'queue';
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async applyJob({ userId, jobId, applied, applied_date }): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const isUser = await this.userModel.findOne({ _id: userId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      const isAppliedJob = await this.UserJobsModel.findOne({ userId, jobId });
      if (isAppliedJob) {
        return await this.UserJobsModel.findOneAndUpdate({ _id: isAppliedJob }, { userId, jobId, applied, applied_date });
      } else {
        return await this.UserJobsModel.create({ userId, jobId, applied, applied_date });
      }
    }
  }

  async saveJob({ userId, jobId, saved, saved_date }): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const isUser = await this.userModel.findOne({ _id: userId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      const isSavedJob = await this.UserJobsModel.findOne({ userId, jobId });
      if (isSavedJob) {
        return await this.UserJobsModel.findOneAndUpdate({ _id: isSavedJob }, { userId, jobId, saved, saved_date });
      } else {
        return await this.UserJobsModel.create({ userId, jobId, saved, saved_date });
      }
    }
  }



  async approveJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exist" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.adminName = isUser.first_name + " " + isUser.last_name;
      jobsDto.status = 'approved';
      if (isJob.reportReason || isJob.reportedBy) {
        jobsDto.reportedBy = null;
        jobsDto.reportReason = null;
      }
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async rejectJob({ adminId, jobId, jobsDto }): Promise<any> {
    adminId = new mongoose.Types.ObjectId(adminId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const isUser = await this.userModel.findOne({ _id: adminId });
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isUser) {
      throw new HttpException({ message: "The given admin does not exist" }, HttpStatus.BAD_REQUEST);
    } if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      jobsDto.adminId = adminId;
      jobsDto.adminName = isUser.first_name + " " + isUser.last_name;
      jobsDto.status = 'rejected';
      if (isJob.reportReason || isJob.reportedBy) {
        jobsDto.reportedBy = null;
        jobsDto.reportReason = null;
      }
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
    }
  }

  async getAllJobs(limit: number, skip: number, adminName: string) {
    let query: any = {}
    if (adminName && adminName.trim() != "") {
      query.adminName = new RegExp(adminName, 'i')
    }
    const count = await this.jobsModel.countDocuments(query).exec();
    const data = await this.jobsModel.find(query).sort({ creationdate: - 1 }).skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getFilterJobs(data: any, limit: number, skip: number) {
    let query: any = {
      status: "approved",
    };
    if (data.jobTitle && data.jobTitle.trim() !== "") {
      query.jobTitle = new RegExp(data.jobTitle, 'i');
    }
    if (data.location && data.location.trim() !== "") {
      query.location = new RegExp(data.location, 'i');
    }
    if (data.company && data.company.trim() !== "") {
      query.company = new RegExp(data.company, 'i');
    }
    if (data.jobCategory && data.jobCategory.trim() !== "") {
      query.jobCategory = new RegExp(data.jobCategory, 'i');
    }
    if (data.subCategory && data.subCategory.trim() !== "") {
      query.subCategory = new RegExp(data.subCategory, 'i');
    }
    if (data.duration && data.duration.trim() !== "") {
      query.duration = new RegExp(data.duration, 'i')
    }
    if (data.rateperhour && data.rateperhour.trim() !== "") {
      query.rateperhour = { $lt: data.rateperhour }
    }
    if (data.weeklyperhour && data.weeklyperhour.trim() !== "") {
      query.weeklyperhour = { $lt: data.weeklyperhour }
    }
    if (data.jobtype && data.jobtype.trim() !== "") {
      query.jobtype = new RegExp(data.jobtype, 'i');
    }
    if (data.date) {
      const today = new Date(); // Get the current date
      today.setDate(today.getDate() - data.date); // Subtracts the specified number of days
      query.creationdate = { $gte: today.toLocaleDateString('en-GB') }
    }

    let sorting: any = { [data.sort]: -1 }
    const total = await this.jobsModel.countDocuments(query).exec();
    const jobs = await this.jobsModel.find(query).sort(sorting).skip(skip).limit(limit).exec();
    return {
      jobs: jobs,
      total: total,
      status: 200,
    }
  }

  async searchSuggestions(searchTerm: string, searchValue: string) {
    const regex = new RegExp(searchValue, 'i'); // Case-insensitive search
    const field = "$" + searchTerm;
    return await this.jobsModel.aggregate([
      { $match: { [searchTerm]: { $regex: regex } } },  // Matching the value with the field
      { $group: { _id: field, unique: { $first: "$_id" } } },  // Grouping if there are more than one value
      { $project: { _id: 0, value: "$_id" } },
      { $limit: 4 }
    ])
  }

  async getApprovedJobs(limit: number, skip: number) {
    const count = await this.jobsModel.countDocuments({ 'status': 'approved' }).exec();
    const data = await this.jobsModel.find({ 'status': 'approved' }).sort({ creationdate: - 1 }).skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getQueueJobs(limit: number, skip: number) {
    const count = await this.jobsModel.countDocuments({ 'status': 'queue' }).exec();
    const data = await this.jobsModel
      .find({
        $or: [
          { status: "approved", reportReason: { $ne: null } },
          { status: "queue" }
        ]
      }).sort({
        reportReason: -1, // if this exist it will be sorted first
        creationdate: -1
      })
      .limit(limit).skip(skip);
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getAssignedJobs(adminId, limit: number, skip: number) {
    adminId = new mongoose.Types.ObjectId(adminId);
    const count = await this.jobsModel.countDocuments({ adminId }).exec();
    const data = await this.jobsModel.aggregate([
      {
        $match: { adminId }
      },
      {
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                {
                  'case': {
                    $eq: [
                      '$status',
                      'review'
                    ]
                  },
                  then: 1
                },
              ],
              'default': 2
            }
          }
        }
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
      }])
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getAppliedJobs(userId, limit: number, skip: number): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    const count = await this.UserJobsModel.countDocuments({ userId, applied: true });
    const jobs = await this.UserJobsModel.find({ userId, applied: true }).sort({ applied_date: -1 }).limit(limit).skip(skip).populate("jobId");
    return {
      jobs: jobs,
      total: count,
      status: 200
    }
  }

  async getUserJobStatus(userId, jobId) {
    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);
    let userApplied = false;
    let userSaved = false;
    const job = await this.UserJobsModel.findOne({ userId, jobId });
    if (job && job.saved == true) {
      userSaved = true;
    }
    if (job && job.applied == true) {
      userApplied = true;
    }
    return {
      saved: userSaved,
      applied: userApplied,
      status: 200
    }
  }

  async getSavedJobs(userId, limit: number, skip: number): Promise<any> {
    userId = new mongoose.Types.ObjectId(userId);
    const count = await this.UserJobsModel.countDocuments({ userId, saved: true });
    const jobs = await this.UserJobsModel.find({ userId, saved: true }).sort({ saved_date: -1 }).limit(limit).skip(skip).populate("jobId");
    return {
      jobs: jobs,
      total: count,
      status: 200
    }
  }

  async getPostedJobs(companyId, limit: number, skip: number, name: string) {
    let query: any = {
      companyId,
    }
    if (name && name.trim() !== "") {
      query.jobTitle = new RegExp(name, 'i');
    }
    const count = await this.jobsModel.countDocuments(query).exec();
    const data = await this.jobsModel.find(query).sort({ creationdate: - 1 }).skip(skip).limit(limit).exec();
    return {
      jobs: data,
      total: count,
      status: 200,
    }
  }

  async getJob(jobId): Promise<any> {
    jobId = new mongoose.Types.ObjectId(jobId);
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    console.log(isJob);
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      let companyId = new mongoose.Types.ObjectId(isJob.companyId);
      const company = await this.companyProfileModel.findOne({ user_id: companyId }, { banner: 1, youtubeUrl: 1, _id: 0 });
      return { ...isJob.toObject(), ...company.toObject() }
    }
  }

  async reportJob({ userId, jobId, reportReason }) {
    jobId = new mongoose.Types.ObjectId(jobId);
    userId = new mongoose.Types.ObjectId(userId);
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    const isUser = await this.userModel.findOne({ _id: userId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    }
    else if (!isUser) {
      throw new HttpException({ message: "The given User does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.jobsModel.findOneAndUpdate({ _id: jobId }, { reportedBy: isUser._id, reportReason });
    }
  }

  async deleteJob(jobId) {
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    console.log(isJob);
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.NOT_FOUND);
    } else {
      return await this.jobsModel.findByIdAndDelete({ _id: jobId });
    }
  }


  @Cron('0 0 * * *') // Every day at midnight
  async checkExpiredJobs() {

  }
}
