import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyProfileDto } from './dto/company-profile.dto';
import { CompanyProfile } from './schema/companyProfile.schema';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('companies')
@UseGuards(AuthGuard)
export class CompaniesController {
    constructor(
        private readonly companyService: CompanyService
    ) { }


    @Get("all")
    async getAllCompanies(): Promise<CompanyProfile[]> {
        return await this.companyService.getAllCompanies()
    }

    @Put('profile/update/:id')
    async companyProfileDto(@Param() data, @Body() companyProfileDto: CompanyProfileDto): Promise<CompanyProfile[]> {
        console.log("update company id", data.id)
        return await this.companyService.updateProfile(data.id, companyProfileDto);
    }

    @Get('profile/:id')
    async getCompany(@Param() data): Promise<CompanyProfile[]> {
        console.log(data.id);
        return await this.companyService.getCompany(data.id);
    }
}
