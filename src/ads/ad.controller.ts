import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AdDto } from './dto/ad.dto';
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

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Post('create')
    async createAdDto(@Body(ValidationPipe) adDto: AdDto): Promise<Ad> {
        return await this.adService.createAd(adDto);
    }

    @UseGuards(AuthGuard)
    @Roles([roles.Company, roles.Recruiter])
    @Post('company')
    @UseInterceptors(FileInterceptor('image', upload(filePath))) // 'image' is the name of the file input
    async createCompanyAd(@UploadedFile() file, @Body(ValidationPipe) adDto: AdDto) {
        adDto.image = file.filename
        return await this.adService.createCompanyAd(adDto);
    }

    @UseGuards(AuthGuard)
    @Roles([roles.Company, roles.Recruiter])
    @Get("company")
    async getCompanyAds(@Req() req) {
        const { id } = req.user
        return await this.adService.getCompanyAds(id)
    }

    @Get("show-ad")
    async showAd(@Query("type") type): Promise<Ad> {
        return await this.adService.showAd(type)
    }

    @Get("specific-ad")
    async specificPageAds(@Query("page") page): Promise<Ad[]> {
        return await this.adService.getSpecificPageAds(page)
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
    @Get(':id')
    async getAd(@Param("id") id) {
        return await this.adService.getAd(id);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteAd(@Param("id") id): Promise<Ad[]> {
        return await this.adService.deleteAd(id);
    }
}
