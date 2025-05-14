import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile } from './schema/companyProfile.schema';
import { CompanyProfileDto, CompanyProfileStatus } from './dto/company-profile.dto';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { Jobs } from 'src/jobs/schema/Jobs.schema';
import { Ads } from 'src/ads/schema/Ads.schema';

import { User } from 'src/users/schema/user.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { RecruiterDto } from './dto/recruiter.dto';
import { Recruiter } from './schema/recruiter.schema';
import { Log } from 'src/audit/Log.schema';
import { ProfileChanges } from './schema/profileChanges.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationDto } from 'src/notifications/dto/notifications.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(Ads.name) private readonly adsModel: Model<Jobs>,

    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Recruiter.name) private readonly recruiterModel: Model<Recruiter>,
    @InjectModel(Log.name) private readonly logModel: Model<Log>,
    @InjectModel(ProfileChanges.name) private readonly profileChangesModel: Model<ProfileChanges>,
    private eventEmitter: EventEmitter2,
  ) { }

  async checkPreviousPhotoExistence(photoPath) {
    try {
      await fs.promises.access(photoPath, fs.promises.constants.F_OK); // Check for file existence
      return true;
    } catch (err) {
      return false; // File not found or other error
    }
  }

  async updateProfile(user_id: string | Types.ObjectId, companyProfileDto: CompanyProfileDto) {
    user_id = new Types.ObjectId(user_id);
    const isUser = await this.companyProfileModel.findOne({ user_id });
    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.NOT_FOUND);
    }

    const changedFields = Object.keys(companyProfileDto).filter((field) => companyProfileDto[field] !== isUser[field]);

    if (changedFields.length === 0) return { message: "No Changes" }

    await this.companyProfileModel.findOneAndUpdate({ user_id }, { status: CompanyProfileStatus.PENDING });

    await this.profileChangesModel.findOneAndUpdate({ company_id: user_id }, { new_profile: companyProfileDto, old_profile: isUser }, { upsert: true })

    return { message: "Update Success" }
  }

  async getCompany(user_id: string | Types.ObjectId) {
    user_id = new Types.ObjectId(user_id);
    const isUser = await this.companyProfileModel.findOne({ user_id });

    if (!isUser) {
      throw new HttpException({ message: "The given user does not exist" }, HttpStatus.BAD_REQUEST);
    }

    if (isUser.status === CompanyProfileStatus.PENDING) {
      const profileWithChanges = await this.profileChangesModel.findOne({ company_id: user_id })

      if (profileWithChanges) {
        const { new_profile } = profileWithChanges.toObject()
        return { ...isUser.toObject(), ...new_profile }
      }

    }
    if (isUser.status === CompanyProfileStatus.REJECTED || isUser.status === CompanyProfileStatus.APPROVED) {
      await this.companyProfileModel.findOneAndUpdate({ user_id }, { status: CompanyProfileStatus.ACTIVE })
    }
    return isUser
  }

  async getPostedJobs(companyId: string, limit: number, skip: number, searchTerm: string) {
    let query: any = {
      companyId,
    }
    if (searchTerm && searchTerm.trim() !== "") {
      query.$or = [{ jobTitle: { $regex: searchTerm, $options: 'i' } }, { employjobreference: { $regex: searchTerm, $options: 'i' } }]
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

  async getPostedAds(company_id: string, limit: number, skip: number, searchTerm: string) {
    let query: any = {};

    // Apply company_id filter only if it's not "all"
    if (company_id !== "all") {
        query.company_id = new Types.ObjectId(company_id);
    }

    if (searchTerm && searchTerm.trim() !== "") {
      query.$or = [{ title: { $regex: searchTerm, $options: 'i' } }, { employjobreference: { $regex: searchTerm, $options: 'i' } }]
    }

    const response = await this.adsModel.aggregate([
  {
    $match: query
  },
  {
    $lookup: {
      from: 'companyprofiles', // Use actual collection name
      localField: 'company_id',
      foreignField: 'user_id',
      as: 'companyInfo'
    }
  },
  {
    $unwind: {
      path: '$companyInfo',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $addFields: {
      companyName: '$companyInfo.name',
      sortPriority: {
        $switch: {
          branches: [
            { case: { $eq: ['$status', 'REJECTED'] }, then: 0 },
            { case: { $eq: ['$status', 'LIVE'] }, then: 1 },
            { case: { $eq: ['$status', 'REVIEW'] }, then: 2 },
            { case: { $eq: ['$status', 'QUEUE'] }, then: 3 },
          ],
          default: 4
        }
      }
    }
  },
  {
    $sort: {
      sortPriority: 1,
    }
  },
  { $skip: skip },
  { $limit: limit },
  {
    $facet: {
      data: [],
      count: [
        { $match: query },
        { $count: 'total' }
      ]
    }
  }
]);


    return {
      total: response[0]?.count[0]?.total,
      ads: response[0]?.data,
      status: 200,
    }
  }


  async getAppliedUsers(jobId: Types.ObjectId, shortlisted: string, limit: number, skip: number) {
    let query: any = {
      jobId,
      applied: true
    }

    if (shortlisted === "true") query.shortlisted = true

    let count = await this.UserJobsModel.countDocuments(query);
    let users = await this.UserJobsModel.find(query).sort({ shortlisted: -1, applied_date: - 1 }).limit(limit).skip(skip).populate('userId').populate("jobId", "jobTitle");
    return {
      users: users,
      total: count,
      status: 200
    }
  }

  async addRecruiter(recruiterData: RecruiterDto) {
    const recruiter = await this.recruiterModel.findOne({ email: recruiterData.email })
      .catch(e => {
        throw new HttpException({ message: "Something went wrong!" }, HttpStatus.INTERNAL_SERVER_ERROR)
      })

    if (recruiter) throw new HttpException({ message: `Recruiter with ${recruiterData.email} already exists` }, HttpStatus.BAD_REQUEST)

    recruiterData.password = await bcrypt.hash(recruiterData.password, 10);

    await this.recruiterModel.create(recruiterData).catch(e => {
      throw new HttpException({ message: "Something went wrong!" }, HttpStatus.INTERNAL_SERVER_ERROR)
    })
    return { message: "Recruiter Added" }
  }



  async editRecruiter(id: string | Types.ObjectId, recruiterData: RecruiterDto) {
    id = new Types.ObjectId(id)

    const recruiter = await this.recruiterModel.findById(id).catch(e => {
      throw new HttpException({ message: "Something went wrong!" }, HttpStatus.INTERNAL_SERVER_ERROR)
    })

    if (!recruiter) throw new HttpException({ message: `Recruiter with ${recruiterData.email} does not exists` }, HttpStatus.NOT_FOUND)

    recruiterData.password = await bcrypt.hash(recruiterData.password, 10);

    await this.recruiterModel.findOneAndUpdate({ _id: id }, recruiterData).catch(e => {
      throw new HttpException({ message: "Something went wrong!" }, HttpStatus.INTERNAL_SERVER_ERROR)
    })

    return { message: "Recruiter Updated" }

  }

  async deleteRecruiter(id: string | Types.ObjectId) {
    id = new Types.ObjectId(id)
    const recruiter = await this.recruiterModel.findById(id)

    if (!recruiter) throw new HttpException({ message: "The given recruiter does not exist" }, HttpStatus.NOT_FOUND);

    await this.recruiterModel.deleteOne({ _id: id })

    return { message: "Recruiter deleted succesfully" }
  }

  async getCompanyRecruiters(companyId: string | Types.ObjectId) {
    companyId = new Types.ObjectId(companyId)
    return await this.recruiterModel.find({ companyId }, { password: 0 })
  }

  async createLogs(previousProfile: CompanyProfile, updatedProfile: CompanyProfileDto) {

    const changes: Log[] = []

    for (const key in updatedProfile) {
      if (updatedProfile[key] !== previousProfile[key]) {
        const change: Log = {
          user_id: previousProfile.user_id.toString(),
          name: updatedProfile.name,
          description: "Updated " + key,
          email: previousProfile.email,
          username: updatedProfile.name,
          fieldName: key,
          changedFrom: previousProfile[key],
          changedTo: updatedProfile[key]
        }
        changes.push(change)
      }
    }

    await this.logModel.insertMany(changes, { ordered: false })
  }

  async getProfilesQueue() {
    const response = await this.profileChangesModel.find({
      $or: [
        { assignedTo: null },
        { assignedTo: { $regex: /^$/ } } // Matches empty strings
      ]
    })
    return response
  }

  async assignProfileToAdmin(id: string, user_id: string) {
    const res = await this.profileChangesModel.findOneAndUpdate({ _id: id }, { assignedTo: user_id })

    if (!res) throw new HttpException({ message: "The company does not exist" }, HttpStatus.NOT_FOUND);

    return { message: "Assigned Successfully" }
  }

  async assignedProfiles(id: string) {
    const res = await this.profileChangesModel.find({ assignedTo: id })
    return res
  }

  async getProfile(id: string) {
    const res = await this.profileChangesModel.findOne({ _id: id })
    if (!res) throw new HttpException({ message: "The company does not exist" }, HttpStatus.NOT_FOUND);
    return res
  }

  async approveProfileChanges(company_id: string) {

    const company = await this.companyProfileModel.findOne({ user_id: company_id })

    if (!company) throw new HttpException({ message: "The company does not exist" }, HttpStatus.NOT_FOUND);

    const changes = await this.profileChangesModel.findOne({ company_id })

    if (!changes) throw new HttpException({ message: "Can't find the company profile" }, HttpStatus.NOT_FOUND);

    const new_profile = changes.toObject().new_profile

    new_profile.status = CompanyProfileStatus.APPROVED

    await Promise.all([
      this.companyProfileModel.findOneAndUpdate({ user_id: company_id }, new_profile),
      this.profileChangesModel.findOneAndDelete({ company_id })
    ])

    if (company.name !== new_profile.name) { // checking if the user name is changed or not

      const name = new_profile.name.split(" ")  // Updating the name in Users Collection

      let [first_name, ...lastName] = name;
      let last_name = lastName.join(" ");

      await this.UserModel.findOneAndUpdate({ _id: company.user_id }, { first_name, last_name });

    }

    if (new_profile.logo) { // checking if logo is changed or not 
      if (company.logo !== "") { // deleting the previous logo if the user is updating the existing logo
        const filePath = path.join(__dirname, '..', '..', "public", "uploads", "logos", company.logo);
        const photoExists = await this.checkPreviousPhotoExistence(filePath)
        if (photoExists) {
          fs.promises.unlink(filePath);
        }
      }
      // Updating the logo in all the jobs posted by the company
      await this.jobsModel.updateMany({ companyId: company_id }, { companyLogo: new_profile.logo });
    }

    if (new_profile.banner) { // checking if Banner is changed or not 
      if (company.banner !== "") { // deleting the previous Banner if the user is updating the existing Banner
        const filePath = path.join(__dirname, '..', '..', "public", "uploads", "banners", company.banner);
        const photoExists = await this.checkPreviousPhotoExistence(filePath)
        if (photoExists) {
          fs.promises.unlink(filePath);
        }
      }
    }

    const notification: NotificationDto = {
      userId: company_id,
      message: "Your profile changes is approved",
      status: "approved"
    }

    this.eventEmitter.emit('notification.create', notification)

    this.createLogs(company, changes?.toObject().new_profile)

    return { message: "Company profile updated" }
  }

  async rejectProfileChanges(company_id: string) {
    const company = await this.companyProfileModel.findOne({ user_id: company_id })

    if (!company) throw new HttpException({ message: "The company does not exist" }, HttpStatus.NOT_FOUND);

    await this.companyProfileModel.findOneAndUpdate({ user_id: company_id }, { status: CompanyProfileStatus.REJECTED })

    await this.profileChangesModel.findOneAndDelete({ company_id })

    const notification: NotificationDto = {
      userId: company_id,
      message: "Your profile changes is rejected",
      status: "rejected"
    }

    this.eventEmitter.emit('notification.create', notification)

    return { message: "Company profile Changes Rejected" }
  }

  async revertChanges(company_id: string) {

    await Promise.all([
      this.companyProfileModel.findOneAndUpdate({ user_id: company_id }, { status: CompanyProfileStatus.APPROVED }),
      this.profileChangesModel.findOneAndDelete({ company_id })
    ])

    return { message: "Changes Reverted" }
  }


  async shortListCandidate(jobId: Types.ObjectId, userId: Types.ObjectId, value: Boolean) {

    await this.UserJobsModel.findOneAndUpdate({ jobId, userId }, { shortlisted: value })

    return { message: value ? "Candidate Shortlisted" : "Candidate removed from the Shortlist" }
  }


}
