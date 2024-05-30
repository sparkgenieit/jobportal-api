import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdDto } from './dto/Ad.dto';
import { Ad } from './schema/Ad.schema';
import { AdService } from './ad.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('ads')
@UseGuards(AuthGuard)
export class AdController {
    constructor(
        private readonly adService: AdService
    ) { }

    @Post('create')
    async createAdDto(@Body() AdDto: AdDto): Promise<Ad> {
        return await this.adService.createAd(AdDto);
    }

    @Get("all")
    async getAds(): Promise<Ad[]> {
        return await this.adService.getAds()
    }

    @Put('update/:id')
    async updateAdDto(@Param() data, @Body() AdDto: AdDto): Promise<Ad[]> {
        console.log("update ads id", data.id)
        return await this.adService.updateAd(data.id, AdDto);
    }

    @Get(':id')
    async getAd(@Param() data): Promise<Ad[]> {
        console.log(data.id);
        return await this.adService.getAd(data.id);
    }
    @Delete('delete/:id')
    async deleteAd(@Param() data): Promise<Ad[]> {
        return await this.adService.deleteAd(data.id);
    }
}
