import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Ad } from './schema/Ad.schema';
import { AdDto, AdStatus } from './dto/ad.dto';
import { convertToObjectId } from 'src/utils/functions';
import { LogService } from 'src/audit/logs.service';
import { AdminLog } from 'src/audit/AdminLog.Schema';


@Injectable()
export class AdService {
  constructor(
    private logSerivce: LogService,
    @InjectModel(Ad.name) private readonly adsModel: Model<Ad>,

  ) { }

  async createAd(adsDto: AdDto) {
    return await this.adsModel.create(adsDto);
  }

  async createCompanyAd(adsDto: AdDto) {
    adsDto.status = AdStatus.QUEUE
    return await this.adsModel.create(adsDto);
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
    return await this.adsModel.find({ show_on_pages: { $in: [regex] } }).sort({ data: 1 });
  }

  async getSpecificPageLiveAds(page: string) {
    const regex = new RegExp(page, 'i') // Eliminating any possibility of any case sensitive issues
    return await this.adsModel.find({ show_on_pages: { $in: [regex] }, status: AdStatus.LIVE }).sort({ data: 1 });
  }

  async showAd(type: string) {
    const ads = await this.adsModel.aggregate([
      { $match: { ad_type: type } },
      { $sample: { size: 1 } }
    ])

    return ads[0]
  }

  async updateAd(adId: string, adsDto: AdDto): Promise<any> {
    const isAd = await this.adsModel.findOne({ _id: adId });
    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adsModel.findOneAndUpdate({ _id: adId }, adsDto);
    }
  }

  async getAds(): Promise<Ad[]> {
    return await this.adsModel.find()
  }

  async getCompanyAds(id: string): Promise<Ad[]> {
    return await this.adsModel.find({ company_id: id })
  }

  async getAd(id: string) {
    const adId = convertToObjectId(id);

    const isAd = await this.adsModel.findOne({ _id: adId });

    if (!isAd) {
      throw new HttpException({ message: "The given Ad does not exist" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.adsModel.findOne({ _id: adId });
    }
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

  
    async assignAd({ adminId, adId , adsDto}): Promise<any> {
      console.log('console.log(adminId);',adsDto);
      adminId = new mongoose.Types.ObjectId(adminId);
      console.log(adminId);
     // adDto = { ...adDto, adminId, status : AdStatus.REVIEW };
     adsDto.adminId = adminId;
     adsDto.status = AdStatus.REVIEW;

       
  console.log('adDtosssss',adsDto);
       const admiLog =  await this.adsModel.findOneAndUpdate({ _id: adId }, adsDto);
  console.log(admiLog);
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
    
  
    async releaseAd({ adminId, adId, adDto }): Promise<any> {
      adminId = new mongoose.Types.ObjectId(adminId);
  
  
        const log: AdminLog = {
          admin_id: adminId,
          name: '',
          adId: adDto._id.toString(),
          fieldName: "Actions",
          changedTo: 'Queue',
          changedFrom: 'AdIn Review',
          description: `Job Released by Admin ${adminId}`
        }
  
        adDto.adminId = "";
        adDto.status =  AdStatus.REVIEW;
  
        await this.adsModel.findOneAndUpdate({ _id: adId }, adDto);
  
        await this.logSerivce.createAdminLog(log)
  
        return { message: "Released Successfully" }
      
  }

  
    async approveAd({ adminId, adId, adDto }): Promise<any> {
      adminId = new mongoose.Types.ObjectId(adminId);

      adDto.adminId = adminId;
      adDto.status = AdStatus.LIVE;
        /*
        if (isJob.reportReason || isJob.reportedBy) {
          await this.emailUserAboutReportedJob(jobsDto, false);
          jobsDto.reportedBy = null;
          jobsDto.reportReason = null;
        }
          */
        await this.adsModel.findOneAndUpdate({ _id: adId }, adDto);
  
  
        const log: AdminLog = {
          admin_id: adminId,
          name: '',
          adId: adDto._id.toString(),
          fieldName: "Actions",
          changedTo: 'LIVE',
          changedFrom: 'AdIn Review',
          description: `AD Approved by Admin ${adminId}`
        }
  
        await this.logSerivce.createAdminLog(log)

   
  
  
        return { message: "Ad Approved" }
      
    }
  
    async rejectAd({ adminId, adId, adDto }): Promise<any> {
      adminId = new mongoose.Types.ObjectId(adminId);

      adDto.adminId = adminId;
        adDto.status = AdStatus.LIVE;
        /*
        if (isJob.reportReason || isJob.reportedBy) {
          await this.emailUserAboutReportedJob(jobsDto, false);
          jobsDto.reportedBy = null;
          jobsDto.reportReason = null;
        }
          */
        await this.adsModel.findOneAndUpdate({ _id: adId }, adDto);
  
  
        const log: AdminLog = {
          admin_id: adminId,
          name: '',
          adId: adDto._id.toString(),
          fieldName: "Actions",
          changedTo: 'REJECTED',
          changedFrom: 'AdIn Review',
          description: `AD Rejected by Admin ${adminId}`
        }
  
        await this.logSerivce.createAdminLog(log)

   
  
  
        return { message: "Ad Rejected" }
      }
    
  
}
