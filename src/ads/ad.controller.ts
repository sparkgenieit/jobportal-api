import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AdDto } from './dto/ad.dto';
import { Ad } from './schema/Ad.schema';
import { AdService } from './ad.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('ads')
export class AdController {
    constructor(
        private readonly adService: AdService
    ) { }

    @UseGuards(AuthGuard)
    @Roles(["superadmin", "employer", "recruiter"])
    @Post('create')
    async createAdDto(@Body(ValidationPipe) adDto: AdDto): Promise<Ad> {
        return await this.adService.createAd(adDto);
    }

    @Get("show-ad")
    async showAd(@Query("type") type): Promise<Ad> {
        return await this.adService.showAd(type)
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("all")
    async getAds(): Promise<Ad[]> {
        return await this.adService.getAds()
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Get("company")
    async getCompanyAds(@Req() req) {
        const { id } = req.user
        return await this.adService.getCompanyAds(id)
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
