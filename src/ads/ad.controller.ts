import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AdDto, AdStatus } from './dto/ad.dto';
import { Ad } from './schema/Ad.schema';
import { AdService } from './ad.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { roles } from 'src/utils/Roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/utils/multerUpload';
import * as path from 'path';

const filePath = path.join(__dirname, "..", "..", "public", "uploads", "ads");

@Controller('ads')
export class AdController {
    constructor(
        private readonly adService: AdService
    ) { }

    // To create an ad by superadmin 
    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Post('create')
    async createAdDto(@Body(ValidationPipe) adDto: AdDto): Promise<Ad> {
        return await this.adService.createAd(adDto);
    }

    //To create an ad from company or the recruiter
    @UseGuards(AuthGuard)
    @Roles([roles.Company, roles.Recruiter])
    @Post('company')
    @UseInterceptors(FileInterceptor('image', upload(filePath))) // 'image' is the name of the file input
    async createCompanyAd(@UploadedFile() file, @Body(ValidationPipe) adDto: AdDto) {
        if (!file) throw new BadRequestException("Please Upload the ad image") // For first time posting an ad, image is required
        adDto.image = file.filename
        return await this.adService.createCompanyAd(adDto);
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
    async showAd(@Query("type") type): Promise<Ad> {
        return await this.adService.showAd(type)
    }

    // to get specific-page ad 
    @Get("specific-ad-live")
    async specificPageLiveAds(@Query("page") page): Promise<Ad[]> {
        return await this.adService.getSpecificPageLiveAds(page)
    }
   // to get specific-page ad 
   @Get("specific-ad")
   async specificPageAds(@Query("page") page): Promise<Ad[]> {
       return await this.adService.getSpecificPageAds(page)
   }

   /*
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
    
    async assignAd(@Body() data: { adminId: string, adId: string, adsDto:AdDto }) : Promise<Ad> {
        return await this.adService.assignAd(data);
    }

      @UseGuards(AuthGuard)
        @Roles(["admin", "superadmin"])
        @Post('release')
        async releaseJob(@Body() data: { adminId: string, adId: string, adsDto:AdDto }) : Promise<Ad> {
            return await this.adService.releaseAd(data);
        }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('multi_release')
    async multiReleaseJob(@Body() bodyData: any, response: any): Promise<Ad> {
        const promises = [];
        bodyData.forEach(async (data: { adminId: string; adId: string, adsDto:AdDto }) => {
            await this.adService.releaseAd(data);
        })
        response = { status: '200' };
        return response;
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('approve')
    async approveAd(@Body() data:  { adminId: string, adId: string, adsDto:AdDto }) : Promise<Ad> {
        return await this.adService.approveAd(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('reject')
    async rejectAd(@Body() data: { adminId: string,  adId: string, adsDto:AdDto }) : Promise<Ad> {
        return await this.adService.rejectAd(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("all")
    async getAds(): Promise<Ad[]> {
        return await this.adService.getAds()
    }


    @UseGuards(AuthGuard)
    @Put('update/:id')
    async updateAdDto(@Param("id") id, @Body(ValidationPipe) adDto: AdDto): Promise<Ad[]> {
        return await this.adService.updateAd(id, adDto);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteAd(@Param("id") id): Promise<Ad[]> {
        return await this.adService.deleteAd(id);
    }

        

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('assignedAds')
    async getAssignedAds(@Query() { limit, skip }, @Req() req) {
        
       
        const { id } = req.user
        return await this.adService.getAssignedAds(id, +limit, +skip);
    }
}
