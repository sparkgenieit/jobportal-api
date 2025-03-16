import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Ads } from './schema/Ads.schema';
import { CompanyAdsDto, AdStatus } from './dto/company-ads.dto';
import { AdminAdsDto } from './dto/admin-ads.dto';
import { convertToObjectId } from 'src/utils/functions';
import { LogService } from 'src/audit/logs.service';
import { AdminLog } from 'src/audit/AdminLog.Schema';
import { User } from 'src/users/schema/user.schema';
import { AdminAds } from './schema/Admin-ads.schema';


@Injectable()
export class AdsService {
  constructor(
    private logSerivce: LogService,
    @InjectModel(Ads.name) private readonly adsModel: Model<Ads>,
    @InjectModel(AdminAds.name) private readonly adminAdsModel: Model<AdminAds>,
    @InjectModel(User.name) private userModel: Model<User>,
    

  ) { }

  async createAd(adminAdsDto: AdminAdsDto) {
    if (adminAdsDto.ad_type === 'above-menu') {
      const existingAd = await this.adminAdsModel.findOne({ ad_type: 'above-menu' });
      if (existingAd) {
        throw new HttpException({ message: "'above-menu' Ad already exists" }, HttpStatus.BAD_REQUEST);
        
      }
    }
    return await this.adminAdsModel.create(adminAdsDto);
  }

  async createCompanyAd(companyAdsDto: CompanyAdsDto) {

    console.log('KIRAN KUMARR CREATED');
    companyAdsDto.status = AdStatus.QUEUE
    await this.userModel.findOneAndUpdate({ _id: companyAdsDto.company_id }, { usedFreeAdCredit: true });

    return await this.adsModel.create(companyAdsDto);
  }

  async updateCompanyAd(id: string, companyAdsDto: CompanyAdsDto): Promise<Ads> {
    const existingAd = await this.adsModel.findById(id);
    if (!existingAd) {
      throw new NotFoundException('Ad not found');
    }
  
    Object.assign(existingAd, companyAdsDto);
    return await existingAd.save();
  }

  async setStatus(status: AdStatus, adId: string) {
    const _id = convertToObjectId(adId)

    // Checking if the Ad exists
    const isAd = await this.adsModel.findOne({ _id });
    if (!isAd) throw new BadRequestException("The given Ad does not exist")

    // Updating the ad
    await this.adsModel.findOneAndUpdate({ _id }, { status });
    return { message: "Status Updated" }
  }

  async assignAdToAdmin(adminId: string, adId: string) {
    const _id = convertToObjectId(adId);
    const AdminId = convertToObjectId(adminId);

    const isAd = await this.adsModel.findOne({ _id });
    if (!isAd) throw new BadRequestException("The given Ad does not exist")

    await this.adsModel.findOneAndUpdate({ _id }, { assigned_to: AdminId });
    return { message: "Ad Assigned to Admin" }
  }

  async getSpecificPageAds(page: string) {
    const regex = new RegExp(page, 'i') // Eliminating any possibility of any case sensitive issues
    return await this.adsModel
    .find({ show_on_pages: { $regex: regex } }) // Direct regex search in array elements
    .sort({ data: 1 });
  }

  async getSpecificCategoryAds(category: string) {
    const regex = new RegExp(category, 'i') // Eliminating any possibility of any case sensitive issues
    return await this.adsModel
    .find({ category: { $regex: regex }, status: AdStatus.LIVE  }) // Direct regex search in array elements
    .sort({ data: 1 });
  }

  

  async getSpecificPageLiveAds(page: string) {
    const regex = new RegExp(`\\b${page}\\b`, 'i'); // Strict Match
    const query = this.adsModel.find({ show_on_pages: { $regex: regex }, status: AdStatus.LIVE }).sort({ data: 1 });
  
    console.log('MongoDB Query:', query.getFilter()); // Print MongoDB Filter
    return await query;
  }

  async showAd(type: string) {
    const ads = await this.adminAdsModel.aggregate([
      { $match: { ad_type: type } },
      { $sample: { size: 1 } }
    ])

    return ads[0]
  }

  async updateAd(adId: string, adminAdsDto: AdminAdsDto): Promise<any> {
    const isAd = await this.adminAdsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adminAdsModel.findOneAndUpdate({ _id: adId }, adminAdsDto);
    }
  }

  async getAds(): Promise<Ads[]> {
    return await this.adsModel.find()
  }
  async getAdminAds(): Promise<AdminAds[]> {
    return await this.adminAdsModel.find()
  }
  
  async getCompanyAds(id: string): Promise<Ads[]> {
    return await this.adsModel.find({ company_id: id })
  }

  async getBlockedDates(adId?: string): Promise<Date[]> {
    let query: any = {};

    if (adId) {
      query = { _id: { $ne: new mongoose.Types.ObjectId(adId) } }; // Exclude current ad
    }

    const ads = await this.adsModel.find(query, { booked_dates: 1 });
    const blockedDates = [...new Set(ads.flatMap(ad => ad.booked_dates || []))];
    
    return blockedDates;
  }
 
  async getAd(id: string) {
    const adId = id;
    const adDetails = await this.adsModel.findOne({ _id: adId });

    if (!adDetails) {
      throw new HttpException({ message: 'The given Ad does not exist' }, HttpStatus.BAD_REQUEST);
    }

 
console.log('adDetails',adDetails);
    return adDetails;
  }


  async deleteAd(id: string): Promise<any> {

    const adId = convertToObjectId(id);

    const isAd = await this.adsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new NotFoundException("The given Ad does not exist");
    } else {
      return await this.adsModel.deleteOne({ _id: adId })
    }
  }

  async deleteAdminAd(id: string): Promise<any> {

    const adId = convertToObjectId(id);

    const isAd = await this.adminAdsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new NotFoundException("The given Ad does not exist");
    } else {
      return await this.adminAdsModel.deleteOne({ _id: adId })
    }
  }
  

  async getAssignedAds(adminId: string | Types.ObjectId, limit: number, skip: number) {
      adminId = new mongoose.Types.ObjectId(adminId);
      const response = await this.adsModel.aggregate([
        {
          $addFields: {
            sortPriority: {
              $switch: {
                branches: [
                  {
                    'case': {
                      $eq: ['$status', AdStatus.REVIEW]
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
        ads: response[0]?.data,
        total: response[0]?.count[0]?.total,
        status: 200,
      }
    }
  
    
  async getQueueAds(limit: number, skip: number) {
    let query = {
      $or: [
        { status: AdStatus.LIVE, reportReason: { $ne: null } },
        { status: AdStatus.QUEUE }
      ]
    }

    const response = await this.adsModel.aggregate([{
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
      ads: response[0]?.data,
      status: 200
    }

  }

  
    async assignAd({ adminId, adId }): Promise<any> {
      adminId = new mongoose.Types.ObjectId(adminId);
      console.log(adminId);
     // adDto = { ...adDto, adminId, status : AdStatus.REVIEW };

     const _id = convertToObjectId(adId);
     const AdminId = convertToObjectId(adminId);
 
     const isAd = await this.adsModel.findOne({ _id });
     if (!isAd) throw new BadRequestException("The given Ad does not exist")
 
     await this.adsModel.findOneAndUpdate({ _id }, { adminId: adminId ,status:AdStatus.REVIEW});
  
        const log: AdminLog = {
          admin_id: adminId,
          
          adId: adId.toString(),
          name:'',
          fieldName: "Actions",
          changedFrom: 'Queue',
          changedTo: "In Review",
          description: `Ad Assigned to ${adminId}`
        }
        await this.logSerivce.createAdminLog(log)
        return { message: "Assigned Successfully" }
      }
    
  
    async releaseAd({ adminId, adId, companyAdsDto }): Promise<any> {
      adminId = new mongoose.Types.ObjectId(adminId);
  
  
        const log: AdminLog = {
          admin_id: adminId,
          name: '',
          adId: companyAdsDto._id.toString(),
          fieldName: "Actions",
          changedTo: 'Queue',
          changedFrom: 'AdIn Review',
          description: `Job Released by Admin ${adminId}`
        }
  
      delete  companyAdsDto.adminId;
        companyAdsDto.status =  AdStatus.QUEUE;
        companyAdsDto = {...companyAdsDto , $unset: { adminId: 1 } }
  
        await this.adsModel.findOneAndUpdate({ _id: adId }, companyAdsDto);
  
        await this.logSerivce.createAdminLog(log)
  
        return { message: "Released Successfully" }
      
  }

  
    async approveAd({ adminId, adId, companyAdsDto }): Promise<any> {
   

      companyAdsDto.adminId = adminId;
      companyAdsDto.status = AdStatus.LIVE;
        /*
        if (isJob.reportReason || isJob.reportedBy) {
          await this.emailUserAboutReportedJob(jobsDto, false);
          jobsDto.reportedBy = null;
          jobsDto.reportReason = null;
        }
          */
        await this.adsModel.findOneAndUpdate({ _id: adId }, companyAdsDto);
  
  
        const log: AdminLog = {
          admin_id: adminId,
          name: '',
          adId: companyAdsDto._id.toString(),
          fieldName: "Actions",
          changedTo: 'LIVE',
          changedFrom: 'AdIn Review',
          description: `AD Approved by Admin ${adminId}`
        }
  
        await this.logSerivce.createAdminLog(log)

   
  
  
        return { message: "Ad Approved" }
      
    }
  
    async rejectAd({ adminId, adId, companyAdsDto }): Promise<any> {
      adminId = new mongoose.Types.ObjectId(adminId);

      companyAdsDto.adminId = adminId;
        companyAdsDto.status = AdStatus.REJECTED;
        /*
        if (isJob.reportReason || isJob.reportedBy) {
          await this.emailUserAboutReportedJob(jobsDto, false);
          jobsDto.reportedBy = null;
          jobsDto.reportReason = null;
        }
          */
        await this.adsModel.findOneAndUpdate({ _id: adId }, companyAdsDto);
  
  
        const log: AdminLog = {
          admin_id: adminId,
          name: '',
          adId: companyAdsDto._id.toString(),
          fieldName: "Actions",
          changedTo: 'REJECTED',
          changedFrom: 'AdIn Review',
          description: `AD Rejected by Admin ${adminId}`
        }
  
        await this.logSerivce.createAdminLog(log)

   
  
  
        return { message: "Ad Rejected" }
      }
    
  
}
