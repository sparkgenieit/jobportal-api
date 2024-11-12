import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Jobs } from './schema/Jobs.schema';
import { JobsDto } from './dto/jobs.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderDto } from 'src/orders/dto/order.dto';
import { Log } from 'src/audit/Log.schema';
import { AdminLog } from 'src/audit/AdminLog.Schema';
import { LogService } from 'src/audit/logs.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(
    private emailService: MailerService,
    private logSerivce: LogService,
    private eventEmitter: EventEmitter2,
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async onModuleInit() {
    this.checkExpiredJobs()
  }

  async postJob(jobsDto: JobsDto, { username, email }): Promise<any> {
    let user = await this.userModel.findOne({ _id: jobsDto.companyId })
    if (user.usedFreeCredit === false) {
      jobsDto.status = 'queue';
      await this.userModel.findOneAndUpdate({ _id: jobsDto.companyId }, { usedFreeCredit: true });
      await this.jobsModel.create(jobsDto);
      const details = {
        description: "Free Job Ad",
        credits: user.credits,
        creditsUsed: 0,
        companyId: user._id
      }

      this.CreateOrder(details)
      return ({ message: "Job Posted" })
    }
    if (user.credits > 0) {
      jobsDto.status = 'queue';
      let credits = user.credits - 1;
      await this.userModel.findOneAndUpdate({ _id: jobsDto.companyId }, { credits: credits });
      const job = await this.jobsModel.create(jobsDto);

      const log: Log = {
        user_id: jobsDto.companyId,
        name: jobsDto.company,
        employerReference: jobsDto.employjobreference,
        jobId: job._id.toString(),
        jobTitle: jobsDto.jobTitle,
        username,
        email,
        fieldName: "Actions",
        changedTo: 'Queue',
        description: "Posted Job"
      }

      await this.logSerivce.createLog(log)

      const details = {
        description: `Job Ad Posted - ${jobsDto.jobTitle}`,
        credits: user.credits - 1,
        creditsUsed: 1,
        companyId: user._id
      }

      this.CreateOrder(details)

      return ({ message: "Job Posted", credits: credits })
    }
    if (user.usedFreeCredit === true && user.credits <= 0) {
      throw new HttpException({ message: "Not Enough Credits, Can't Post this Job" }, HttpStatus.BAD_REQUEST);
    }
  }

  async updateJob(jobId, jobsDto: JobsDto, user: any): Promise<any> {
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      if (isJob.status === "expired" || isJob.status === "closed") {
        return await this.repostExpiredJob(isJob, jobsDto)
      }
      jobsDto.status = 'queue';
      jobsDto.adminId = null;
      jobsDto.adminName = "";
      await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);
      await this.createLogs(user, isJob, jobsDto)
      return { message: "Updated Success" }
    }
  }

  async createLogs(user: any, previousJob: any, updatedJob: JobsDto) {
    const { status, adminId, adminName, creationdate, employerquestions, ...fieldsTobeChecked } = updatedJob

    let changes: Log[] = []

    for (const key in fieldsTobeChecked) {
      if (updatedJob[key] !== previousJob[key]) {
        let change: Log = {
          user_id: updatedJob.companyId,
          name: updatedJob.company,
          jobId: previousJob._id,
          employerReference: updatedJob.employjobreference,
          jobTitle: updatedJob.jobTitle,
          fieldName: key,
          username: user.username,
          email: user.email,
          description: "Changed " + key,
          changedFrom: previousJob[key],
          changedTo: updatedJob[key]
        }
        changes.push(change)
      }
    }
    await this.logSerivce.InsertManyLogs(changes)
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

      await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);

      const log: AdminLog = {
        admin_id: adminId,
        name: jobsDto.adminName,
        jobId: jobsDto._id.toString(),
        employerReference: jobsDto.employjobreference,
        jobTitle: jobsDto.jobTitle,
        email: isUser.email,
        fieldName: "Actions",
        changedFrom: 'Queue',
        changedTo: "In Review",
        description: `Job Assigned to ${jobsDto.adminName}`
      }
      await this.logSerivce.createAdminLog(log)
      return { message: "Assigned Successfully" }
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

      const log: AdminLog = {
        admin_id: adminId,
        name: jobsDto.adminName,
        jobId: jobsDto._id.toString(),
        jobTitle: jobsDto.jobTitle,
        employerReference: jobsDto.employjobreference,
        email: isUser.email,
        fieldName: "Actions",
        changedTo: 'Queue',
        changedFrom: 'In Review',
        description: `Job Released by ${jobsDto.adminName}`
      }

      jobsDto.adminId = "";
      jobsDto.adminName = "";
      jobsDto.status = 'queue';

      await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);

      await this.logSerivce.createAdminLog(log)

      return { message: "Released Successfully" }
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

  async emailUserAboutReportedJob(jobsDto: JobsDto, status: Boolean) {
    const userId: Types.ObjectId = jobsDto.reportedBy
    const user = await this.userModel.findOne({ _id: userId })
    await this.emailService.sendMail({
      to: user.email,
      subject: `Regarding the issue you found in the posting of ${jobsDto.jobTitle} by ${jobsDto.company}`,
      // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
      template: 'user/user_reported_job',
      context: {
        name: user.first_name + ' ' + user.last_name,
        jobDetails: jobsDto,
        issueFound: status
      },
    });

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
        await this.emailUserAboutReportedJob(jobsDto, false);
        jobsDto.reportedBy = null;
        jobsDto.reportReason = null;
      }
      await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto);

      const log: Log = {
        user_id: jobsDto.companyId,
        name: jobsDto.adminName,
        jobId: jobsDto._id.toString(),
        jobTitle: jobsDto.jobTitle,
        username: jobsDto.adminName,
        email: isUser.email,
        fieldName: "Actions",
        changedFrom: "In Review",
        changedTo: 'Live',
        description: "Job Approved by Admin"
      }

      const adminLog: AdminLog = {
        admin_id: jobsDto.adminId,
        name: jobsDto.adminName,
        jobId: jobsDto._id.toString(),
        jobTitle: jobsDto.jobTitle,
        email: isUser.email,
        fieldName: "Actions",
        changedFrom: "In Review",
        changedTo: 'Live',
        description: `Job Approved by ${jobsDto.adminName}`
      }

      await Promise.all([
        this.logSerivce.createLog(log),
        this.logSerivce.createAdminLog(adminLog)
      ])


      return { message: "Job Approved" }
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
        await this.emailUserAboutReportedJob(jobsDto, true);
        jobsDto.reportedBy = null;
        jobsDto.reportReason = null;
      }

      await this.jobsModel.findOneAndUpdate({ _id: jobId }, jobsDto)

      const log: Log = {
        user_id: jobsDto.companyId,
        name: jobsDto.adminName,
        jobId: jobsDto._id.toString(),
        jobTitle: jobsDto.jobTitle,
        username: jobsDto.adminName,
        email: isUser.email,
        fieldName: "Actions",
        changedTo: 'Rejected',
        description: "Job Rejected by Admin"
      }

      const adminLog: AdminLog = {
        admin_id: jobsDto.adminId,
        name: jobsDto.adminName,
        jobId: jobsDto._id.toString(),
        jobTitle: jobsDto.jobTitle,
        email: isUser.email,
        fieldName: "Actions",
        changedTo: 'Rejected',
        description: `Job Rejected by ${jobsDto.adminName}`
      }

      await Promise.all([
        this.logSerivce.createLog(log),
        this.logSerivce.createAdminLog(adminLog)
      ])


      return { message: "Job Rejected" }
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

    if (data?.jobTitle?.trim()) {
      query.jobTitle = new RegExp(data?.jobTitle, 'i');
    }
    if (data?.location?.trim()) {
      query.location = new RegExp(data?.location, 'i');
    }
    if (data?.company?.trim()) {
      query.company = new RegExp(data?.company, 'i');
    }
    if (data?.jobCategory?.trim()) {
      query.jobCategory = new RegExp(data?.jobCategory, 'i');
    }
    if (data?.subCategory?.trim()) {
      query.subCategory = new RegExp(data?.subCategory, 'i');
    }
    if (data?.duration?.trim()) {
      query.duration = new RegExp(data?.duration, 'i')
    }

    if (data?.rateperhour?.trim()) {
      let salary: number;
      if (data?.salaryType === "per annum") {
        salary = Math.round((data?.rateperhour?.replace(/[K+]/gi, '') * 1000) / 2080)  // Converting the per annum to per hour as we are saving in per hour in db    
      } else {
        salary = +data?.rateperhour?.replace("+", "")
      }
      query.rateperhour = { $gte: salary }
    }

    if (data?.weeklyperhour?.trim()) {
      query.weeklyperhour = { $lte: +data?.weeklyperhour }
    }
    if (data?.jobtype?.trim()) {
      query.jobtype = new RegExp(data?.jobtype, 'i');
    }
    if (data?.date) {
      const today = new Date(); // Get the current date
      today.setDate(today.getDate() - data?.date); // Subtracts the specified number of days
      query.creationdate = { $gte: today }
    }
    let sorting: any = { [data?.sort]: -1 }

    const response = await this.jobsModel.aggregate([
      {
        $facet: {
          jobs: [
            { $match: query },
            { $sort: sorting },
            { $skip: skip },
            { $limit: limit },
            { $addFields: { companyId: { $toObjectId: "$companyId" } } },
            {
              $lookup: {
                from: 'companyprofiles',
                localField: "companyId",
                foreignField: 'user_id',
                as: 'info'
              }
            },
            {
              $addFields:
              {
                info: { $arrayElemAt: ['$info.info', 0] },
              }
            }
          ],
          count: [{ $match: query }, { $count: 'total' }]
        }
      }
    ])
    return {
      jobs: response[0].jobs,
      total: response[0].count[0]?.total || 0,
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
    let query = {
      $or: [
        { status: "approved", reportReason: { $ne: null } },
        { status: "queue" }
      ]
    }

    const response = await this.jobsModel.aggregate([{
      $facet: {
        data: [
          { $match: query },
          {
            $sort:
            {
              reportReason: -1, // if this exist it will be sorted first
              creationdate: -1
            }
          },
          { $skip: skip },
          { $limit: limit }
        ],
        count: [{ $match: query }, { $count: 'total' }]
      }
    }]);

    return {
      total: response[0]?.count[0]?.total,
      jobs: response[0]?.data,
      status: 200
    }

  }

  async getAssignedJobs(adminId: string | Types.ObjectId, limit: number, skip: number) {
    adminId = new mongoose.Types.ObjectId(adminId);
    const response = await this.jobsModel.aggregate([
      {
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                {
                  'case': {
                    $eq: ['$status', 'review']
                  },
                  then: 1
                },
              ],
              'default': 2
            }
          }
        }
      }, {
        $facet: {
          data: [
            { $match: { adminId } },
            {
              $sort:
              {
                sortPriority: 1,
                creationdate: - 1,
              }
            },
            { $skip: skip },
            { $limit: limit }
          ],
          count: [{ $match: { adminId } }, { $count: 'total' }]
        }
      }
    ])

    return {
      jobs: response[0]?.data,
      total: response[0]?.count[0]?.total,
      status: 200,
    }
  }

  async getAppliedJobs(userId, limit: number, skip: number): Promise<any> {
    try {
      userId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    }
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
    let shortlisted = false;
    const job = await this.UserJobsModel.findOne({ userId, jobId });
    if (job && job.saved) {
      userSaved = true;
    }
    if (job && job.applied) {
      userApplied = true;
    }
    if (job && job.shortlisted) {
      shortlisted = true;
    }
    return {
      saved: userSaved,
      applied: userApplied,
      shortlisted: shortlisted,
      status: 200
    }
  }

  async getSavedJobs(userId: string | Types.ObjectId, limit: number, skip: number): Promise<any> {
    try {
      userId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    }
    const count = await this.UserJobsModel.countDocuments({ userId, saved: true });
    const jobs = await this.UserJobsModel.find({ userId, saved: true }).sort({ saved_date: -1 }).limit(limit).skip(skip).populate("jobId");
    return {
      jobs: jobs,
      total: count,
      status: 200
    }
  }

  async getJob(jobId: Types.ObjectId | string): Promise<any> {
    jobId = new mongoose.Types.ObjectId(jobId);
    const jobs = await this.jobsModel.aggregate([
      { $match: { _id: jobId } },
      { $addFields: { company_id: { $toObjectId: "$companyId" } } },
      {
        $lookup: {
          from: 'companyprofiles',
          localField: "company_id",
          foreignField: 'user_id',
          as: 'banner'
        }
      },
      {
        $addFields: {
          banner: { $arrayElemAt: ['$banner.banner', 0] },
          youtubeUrl: { $arrayElemAt: ['$banner.youtubeUrl', 0] },
          info: { $arrayElemAt: ['$banner.info', 0] }
        }
      }
    ])
    return jobs[0]
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

  async deleteJob({ username, email }: any, jobId: string) {
    const isJob = await this.jobsModel.findOne({ _id: jobId });
    if (!isJob) {
      throw new HttpException({ message: "The given Job does not exist" }, HttpStatus.NOT_FOUND);
    } else {

      await this.jobsModel.findByIdAndDelete({ _id: jobId });

      const log: Log = {
        user_id: isJob.companyId.toString(),
        name: isJob.company,
        employerReference: isJob.employjobreference,
        jobId: jobId,
        jobTitle: isJob.jobTitle,
        username,
        email,
        fieldName: "Actions",
        changedTo: 'Deleted',
        description: "Deleted Job"
      }
      await this.logSerivce.createLog(log)

      return { message: "Job deleted" }
    }
  }

  async closeJob(jobId: Types.ObjectId, userId: string, { username, email }) {
    const isJob = await this.jobsModel.findOne({ _id: jobId, companyId: userId })
    if (!isJob) throw new HttpException({ message: "No job found" }, HttpStatus.NOT_FOUND);
    isJob.status = "closed"
    isJob.closedate = new Date().toISOString()
    await this.jobsModel.findOneAndUpdate({ _id: isJob._id }, isJob)

    const log: Log = {
      user_id: isJob.companyId.toString(),
      name: isJob.company,
      employerReference: isJob.employjobreference,
      jobId: jobId.toString(),
      jobTitle: isJob.jobTitle,
      username,
      email,
      fieldName: "Actions",
      changedTo: 'Closed',
      description: "Closed Job"
    }
    await this.logSerivce.createLog(log)
    return { message: "success" }
  }


  async repostExpiredJob(jobInDB, jobUserSent) {
    let isEqual = true

    const valueToBeCheckedForEquality = ["jobType", "location", "employjobreference", "numberofvacancies", "jobTitle", "rateperhour",
      "duration", "jobCategory", "subCategory", "weeklyperhour", "benifits", "training", "description", "employerquestions", "employer"]

    for (let field of valueToBeCheckedForEquality) {
      jobUserSent[field] !== jobInDB[field] ? isEqual = false : null
    }


    const jobId = new mongoose.Types.ObjectId(jobInDB.companyId)
    const company = await this.userModel.findOne({ _id: jobId })

    if (company.credits > 0) {
      jobUserSent = isEqual ? { ...jobUserSent, status: "approved" } : { ...jobUserSent, status: "queue", adminName: "", adminId: null }
      jobUserSent.creationdate = new Date()
      await this.jobsModel.findOneAndUpdate({ _id: jobInDB._id }, jobUserSent);
      await this.userModel.findOneAndUpdate({ _id: jobId }, { credits: company.credits - 1 })

      const details = {
        companyId: company._id,
        description: `Job Ad Reposted - ${jobUserSent.jobTitle}`,
        credits: company.credits - 1,
        creditsUsed: 1,
      }

      this.CreateOrder(details);

      return { message: "Update Success" }

    } else {
      throw new HttpException({ message: "Not Enough Credits to Post the Job" }, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  CreateOrder(details: OrderDto) {
    this.eventEmitter.emit("order.create", details)
  }

  async refundCredits() {
    const companies = await this.jobsModel.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: '$companyId',
          jobCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          _id: { $toObjectId: '$_id' }
        }
      }
    ])

    const updatedCreditsData = companies.map(({ _id, jobCount }) => (
      {
        updateOne: {
          filter: { _id },
          update: { $inc: { credits: jobCount } }
        }
      }
    ));

    await this.userModel.bulkWrite(updatedCreditsData, { ordered: false });

    const companyIds = companies.map(company => (company._id))

    const companiesWithUpdatedCredits = await this.userModel.find({ _id: { $in: companyIds } }, { credits: 1 })

    const creatingOrders: OrderDto[] = companiesWithUpdatedCredits.map(company => ({
      created_date: new Date(),
      companyId: company._id,
      description: "Credit Refund",
      amount: 0,
      creditsPurchased: companies.filter((c) => c._id.toString() === company._id.toString())[0].jobCount,
      credits: company.credits
    }))

    this.eventEmitter.emit("order.create-many", creatingOrders)
  }

  async increaseViewCount(id: string) {
    const _id = new Types.ObjectId(id)
    await this.jobsModel.updateOne({ _id }, { $inc: { views: 1 } })
    return { message: "View Count Updated" }
  }

  @Cron('0 0 * * *') // Every day at midnight
  async checkExpiredJobs() {
    const closeDate = new Date().toISOString()
    const jobs = await this.jobsModel.find({ closedate: { $lte: closeDate }, status: "approved" })

    if (jobs.length > 0) {

      const logs: Log[] = jobs.map(job => (
        {
          user_id: job.companyId.toString(),
          name: job.company,
          jobId: job._id.toString(),
          jobTitle: job.jobTitle,
          fieldName: "Actions",
          changedTo: 'Expired',
          description: "Job Expired"
        }
      ))

      await this.jobsModel.updateMany({ closedate: { $lte: closeDate }, status: "approved" }, { status: "expired" });
      await this.logSerivce.InsertManyLogs(logs)
    }
  }
}
