import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
        console.log('data', data);
        console.log("update company id", data.id)
        return await this.companyService.updateProfile(data.id, companyProfileDto);
    }

    @Get('profile/:id')
    async getCompany(@Param() data): Promise<CompanyProfile[]> {
        console.log(data.id);
        return await this.companyService.getCompany(data.id);
    }

    @Get('postedJobs/:companyId')
    async getPostedJobs(@Param() data, @Query() { limit, skip, name }) {
        return await this.companyService.getPostedJobs(data.companyId, +limit, +skip, name);
    }

    @Get('/applied-users/:id')
    async getAppliedUsers(@Param() data, @Query() { limit, skip }) {
        return await this.companyService.getAppliedUsers(data.id, +limit, +skip);
    }
    @Get('/applied-users-count/:jobId')
    async getAppliedUsersCount(@Param() data) {
        return await this.companyService.getAppliedUsersCount(data.jobId);
    }

    @Put('/shortlist-candidate')
    async shortListCandidate(@Body() { userId, jobId }) {
        return await this.companyService.shortListCandidate(jobId, userId);
    }
}
