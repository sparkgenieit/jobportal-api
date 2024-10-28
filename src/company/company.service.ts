import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfile } from './schema/companyProfile.schema';
import { CompanyProfileDto, CompanyProfileStatus } from './dto/company-profile.dto';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { Jobs } from 'src/jobs/schema/Jobs.schema';
import { User } from 'src/users/schema/user.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { RecruiterDto } from './dto/recruiter.dto';
import { Recruiter } from './schema/recruiter.schema';
import { Log } from 'src/audit/Log.schema';
import { ProfileChanges } from './schema/profileChanges.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Jobs.name) private readonly jobsModel: Model<Jobs>,
    @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Recruiter.name) private readonly recruiterModel: Model<Recruiter>,
    @InjectModel(Log.name) private readonly logModel: Model<Log>,
    @InjectModel(ProfileChanges.name) private readonly profileChangesModel: Model<ProfileChanges>,
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

    // if (isUser.name !== companyProfileDto.name) { // checking if the user name is changed or not

    //   const name = companyProfileDto.name.split(" ")  // Updating the name in Users Collection

    //   let [first_name, ...lastName] = name;
    //   let last_name = lastName.join(" ");

    //   await this.UserModel.findOneAndUpdate({ _id: user_id }, { first_name, last_name });
    // }

    // if (companyProfileDto.logo) { // checking if logo is changed or not 
    //   if (isUser.logo !== "") { // deleting the previous logo if the user is updating the existing logo
    //     const filePath = path.join(__dirname, '..', '..', "public", "uploads", "logos", isUser.logo);
    //     const photoExists = await this.checkPreviousPhotoExistence(filePath)
    //     if (photoExists) {
    //       await fs.promises.unlink(filePath);
    //     }
    //   }
    //   // Updating the logo in all the jobs posted by the company
    //   await this.jobsModel.updateMany({ companyId: user_id.toString() }, { companyLogo: companyProfileDto.logo });
    // }

    // if (companyProfileDto.banner) { // checking if Banner is changed or not 
    //   if (isUser.banner !== "") { // deleting the previous Banner if the user is updating the existing Banner
    //     const filePath = path.join(__dirname, '..', '..', "public", "uploads", "banners", isUser.banner);
    //     const photoExists = await this.checkPreviousPhotoExistence(filePath)
    //     if (photoExists) {
    //       await fs.promises.unlink(filePath);
    //     }
    //   }
    // }

    // await this.createLogs(isUser, companyProfileDto)

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
          email: updatedProfile.email,
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

      this.UserModel.findOneAndUpdate({ _id: company.user_id }, { first_name, last_name });
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
      this.jobsModel.updateMany({ companyId: company_id }, { companyLogo: new_profile.logo });
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

    this.createLogs(company, changes?.toObject().new_profile)

    return { message: "Company profile updated" }
  }

  async rejectProfileChanges(company_id: string) {
    const company = await this.companyProfileModel.findOne({ user_id: company_id })

    if (!company) throw new HttpException({ message: "The company does not exist" }, HttpStatus.NOT_FOUND);

    await this.companyProfileModel.findOneAndUpdate({ user_id: company_id }, { status: CompanyProfileStatus.REJECTED })

    await this.profileChangesModel.findOneAndDelete({ company_id })

    return { message: "Company profile Changes Rejected" }
  }

  async revertChanges(company_id: string) {

    await this.companyProfileModel.findOneAndUpdate({ user_id: company_id }, { status: CompanyProfileStatus.APPROVED })
      .catch(e => { throw new HttpException({ message: `Something went wrong! Please try again` }, HttpStatus.INTERNAL_SERVER_ERROR) })

    return { message: "Changes Reverted" }
  }


  async shortListCandidate(jobId: Types.ObjectId, userId: Types.ObjectId, value: Boolean) {

    await this.UserJobsModel.findOneAndUpdate({ jobId, userId }, { shortlisted: value })

    return { message: value ? "Candidate Shortlisted" : "Candidate removed from the Shortlist" }
  }


}
