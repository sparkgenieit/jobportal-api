import { Body, Controller, Get, Param, ParseBoolPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyProfileDto } from './dto/company-profile.dto';
import { CompanyProfile } from './schema/companyProfile.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RecruiterDto } from './dto/recruiter.dto';

@UseGuards(AuthGuard)
@Controller('companies')
export class CompaniesController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @Get("all")
    async getAllCompanies(): Promise<CompanyProfile[]> {
        return await this.companyService.getAllCompanies()
    }

    @Roles(["employer"])
    @Post('add-recruiter')
    async addRecruiter(@Body() data: RecruiterDto) {
        return await this.companyService.addRecruiter(data)
    }

    @Roles(["employer"])
    @Put('profile/update/:id')
    async companyProfileDto(@Param() data, @Body() companyProfileDto: CompanyProfileDto): Promise<CompanyProfile[]> {
        console.log('data', data);
        console.log("update company id", data.id)
        return await this.companyService.updateProfile(data.id, companyProfileDto);
    }

    @Roles(["employer"])
    @Get('profile/:id')
    async getCompany(@Param() data): Promise<CompanyProfile[]> {
        console.log(data.id);
        return await this.companyService.getCompany(data.id);
    }

    @Roles(["employer"])
    @Get('postedJobs/:companyId')
    async getPostedJobs(@Param() data, @Query() { limit, skip, name }) {
        return await this.companyService.getPostedJobs(data.companyId, +limit, +skip, name);
    }

    @Roles(["employer"])
    @Get('/applied-users/:id')
    async getAppliedUsers(@Param() data, @Query() { limit, skip, shortlisted }) {
        return await this.companyService.getAppliedUsers(data.id, shortlisted, +limit, +skip);
    }

    @Roles(["employer"])
    @Patch('/shortlist-candidate')
    async shortListCandidate(@Body() { userId, jobId, value }) {
        return await this.companyService.shortListCandidate(jobId, userId, value);
    }
}
