import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
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
    @Roles(["superadmin"])
    @Post('create')
    async createAdDto(@Body(ValidationPipe) AdDto: AdDto): Promise<Ad> {
        return await this.adService.createAd(AdDto);
    }

    @Get("show-ad")
    async showAd(@Query("type") type): Promise<Ad> {
        return await this.adService.showAd(type)
    }

    @Get("all")
    async getAds(): Promise<Ad[]> {
        return await this.adService.getAds()
    }

    @UseGuards(AuthGuard)
    @Put('update/:id')
    async updateAdDto(@Param() data, @Body() AdDto: AdDto): Promise<Ad[]> {
        console.log("update ads id", data.id)
        return await this.adService.updateAd(data.id, AdDto);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getAd(@Param() data): Promise<Ad[]> {
        console.log(data.id);
        return await this.adService.getAd(data.id);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteAd(@Param() data): Promise<Ad[]> {
        return await this.adService.deleteAd(data.id);
    }
}
