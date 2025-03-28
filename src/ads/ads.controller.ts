import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { CompanyAdsDto, AdStatus } from './dto/company-ads.dto';
import { AdminAdsDto} from './dto/admin-ads.dto';
import { Ads } from './schema/Ads.schema';
import { AdminAds } from './schema/Admin-ads.schema';
import { AdsService } from './ads.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { roles } from 'src/utils/Roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/utils/multerUpload';
import * as path from 'path';
import { single } from 'rxjs';

const filePath = path.join(__dirname, "..", "..", "public", "uploads", "ads");

@Controller('ads')
export class AdsController {
    constructor(
    
        private readonly adService: AdsService
    ) {console.log('ADSSSSSSSSSS'); }

    // To create an ad by superadmin 
    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Post('create')
    async create(@Body(ValidationPipe) adminAdsDto: AdminAdsDto): Promise<AdminAds> {
        return await this.adService.createAd(adminAdsDto);
    }

    //To create an ad from company or the recruiter
    @UseGuards(AuthGuard)
    @Roles([roles.Company, roles.Recruiter])
    @Post('company')
    @UseInterceptors(FileInterceptor('image', upload(filePath))) // 'image' is the name of the file input
    async createCompanyAd(@UploadedFile() file, @Body(ValidationPipe) companyAdsDto: CompanyAdsDto) {
        console.log('kkkkkUUUUU');
        if (!file) throw new BadRequestException("Please Upload the ad image") // For first time posting an ad, image is required
        companyAdsDto.image = file.filename
        return await this.adService.createCompanyAd(companyAdsDto);
    }

    @UseGuards(AuthGuard)
@Roles([roles.Company, roles.Recruiter])
@Put('company/:id')
@UseInterceptors(FileInterceptor('image', upload(filePath))) // Intercept image upload
async updateCompanyAd(
  @Param('id') id: string,
  @UploadedFile() file,
  @Body(ValidationPipe) companyAdsDto: CompanyAdsDto
): Promise<Ads> {
  console.log('Updating Company Ad...');
  
  // If file is uploaded, assign new image filename
  if (file) {
    companyAdsDto.image = file.filename;
  }

  // Call service method to update ad
  return await this.adService.updateCompanyAd(id, companyAdsDto);
}

    // to get company ads 
    @UseGuards(AuthGuard)
    @Roles([roles.Company, roles.Recruiter])
    @Get("company")
    async getCompanyAds(@Req() req) {
        const { id } = req.user
        return await this.adService.getCompanyAds(id)
    }

    // showing of ads
    @Get("show-ad")
    async showAd(@Query("type") type): Promise<AdminAds> {
        return await this.adService.showAd(type)
    }

   
    // to get specific-page ad 
    @Get("specific-ad-live")
    async specificPageLiveAds(@Query("page") page): Promise<Ads[]> {
        return await this.adService.getSpecificPageLiveAds(page)
    }
   // to get specific-page ad 
   @Get("specific-ad")
   async specificPageAds(@Query("page") page): Promise<Ads[]> {
       return await this.adService.getSpecificPageAds(page)
   }
   /*
    // to get specific-page ad 
    @Get("category-ad")
    async specificCategoryAds(@Query("category") category): Promise<Ads[]> {
        return await this.adService.getSpecificCategoryAds(category)
    }

    // to approve an ad
    @UseGuards(AuthGuard)
    @Roles([roles.Admin])
    @Put("approve/:id")
    async approveAd(@Param("id") id) {
        return await this.adService.setStatus(AdStatus.LIVE, id)
    }

    //to reject an ad
    @UseGuards(AuthGuard)
    @Roles([roles.Admin])
    @Put("reject/:id")
    async rejectAd(@Param("id") id) {
        return await this.adService.setStatus(AdStatus.REJECTED, id)
    }
*/
    // to assign an ad to admin
    @UseGuards(AuthGuard)
    @Roles([roles.Admin])
    @Put("assign/:id")
    async assignAdToAdmin(@Req() req) {
        const { id } = req.user // Taking the admin id from the request
        return await this.adService.assignAdToAdmin(id, req.params.id)
    }
    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get("queue")
    async getQueuejobs(@Query() { limit, skip }) {
        return await this.adService.getQueueAds(+limit, +skip)
    }


     @UseGuards(AuthGuard)
    @Roles([roles.Admin, "superadmin"])
    @Post('assign')
    
    async assignAd(@Body() data: { adminId: string, adId: string}) : Promise<Ads> {
        return await this.adService.assignAd(data);
    }

      @UseGuards(AuthGuard)
        @Roles(["admin", "superadmin"])
        @Post('release')
        async releaseJob(@Body() data: { adminId: string, adId: string, companyAdsDto:CompanyAdsDto }) : Promise<Ads> {
            return await this.adService.releaseAd(data);
        }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('multi_release')
    async multiReleaseJob(@Body() bodyData: any, response: any): Promise<Ads> {
        const promises = [];
        bodyData.forEach(async (data: { adminId: string; adId: string, companyAdsDto:CompanyAdsDto }) => {
            await this.adService.releaseAd(data);
        })
        response = { status: '200' };
        return response;
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('approve')
    async approveAd(@Body() data:  { adminId: string, adId: string, companyAdsDto:CompanyAdsDto }) : Promise<Ads> {
        return await this.adService.approveAd(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('reject')
    async rejectAd(@Body() data: { adminId: string,  adId: string, companyAdsDto:CompanyAdsDto }) : Promise<Ads> {
        return await this.adService.rejectAd(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("all")
    async getAds(): Promise<Ads[]> {
        return await this.adService.getAds()
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("adminads")
    async getAdminAds(): Promise<AdminAds[]> {
        return await this.adService.getAdminAds()
    }



    @UseGuards(AuthGuard)
    @Put('update/:id')
    async updateAd(@Param("id") id, @Body(ValidationPipe) adminAdsDto: AdminAdsDto): Promise<AdminAds[]> {
        return await this.adService.updateAd(id, adminAdsDto);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteAd(@Param("id") id): Promise<Ads[]> {
        return await this.adService.deleteAd(id);
    }

    @UseGuards(AuthGuard)
    @Delete('delete-admin/:id')
    async deleteAdminAd(@Param("id") id): Promise<AdminAds[]> {
        return await this.adService.deleteAdminAd(id);
    }
        

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('assignedAds')
    async getAssignedAds(@Query() { limit, skip }, @Req() req) {
        
       
        const { id } = req.user
        return await this.adService.getAssignedAds(id, +limit, +skip);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin","employer"])
   @Get('details/:id')
    async getAd(@Param() data) {
        return await this.adService.getAd(data.id);
    }

    @Get('blocked-dates/:id?')
    async getBlockedDates(
      @Param('id') adId?: string,
      @Query('type') type?: string, // Accept 'type' as a query parameter
    ) {
      if (!type) {
        throw new BadRequestException('Type is required');
      }
      return await this.adService.getBlockedDates(type, adId);
    }
    
}
