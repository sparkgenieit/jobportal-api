import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
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

    @Roles(["employer"])
    @Post('/recruiter')
    async addRecruiter(@Body() data: RecruiterDto) {
        return await this.companyService.addRecruiter(data)
    }

    @Roles(["employer"])
    @Get('/recruiters')
    async getCompanyRecruiters(@Req() req) {
        const { id } = req.user
        return await this.companyService.getCompanyRecruiters(id)
    }

    @Roles(["employer"])
    @Delete('/recruiter/:id')
    async deleteRecruiter(@Param() { id }) {
        return await this.companyService.deleteRecruiter(id)
    }

    @Roles(["employer"])
    @Put('/recruiter/:id')
    async editRecruiter(@Param() { id }, @Body() data: RecruiterDto) {
        return await this.companyService.editRecruiter(id, data)
    }

    @Roles(["employer"])
    @Put('profile/update/:id')
    async companyProfileDto(@Param() data, @Body() companyProfileDto: CompanyProfileDto) {
        return await this.companyService.updateProfile(data.id, companyProfileDto);
    }

    @Roles(["employer", "recruiter"])
    @Get('profile/:id')
    async getCompany(@Param() data): Promise<CompanyProfile> {
        if (data.id) {
            return await this.companyService.getCompany(data.id);
        }
    }

    @Roles(["employer", "recruiter"])
    @Get('postedJobs/:companyId')
    async getPostedJobs(@Param() data, @Query() { limit, skip, name }) {
        return await this.companyService.getPostedJobs(data.companyId, +limit, +skip, name);
    }

    @Roles(["employer", "recruiter", "admin", "superadmin"])
    @Post('logs')
    async getLogs(@Req() req) {
        let { id, role, companyId } = req.user

        if (role === "recruiter") id = companyId
        const data = req.body
        const { limit, skip } = req.query
        return await this.companyService.getLogs(id, role, +limit, +skip, data);
    }

    @Roles(["employer", "recruiter"])
    @Get('/applied-users/:id')
    async getAppliedUsers(@Param() data, @Query() { limit, skip, shortlisted }) {
        return await this.companyService.getAppliedUsers(data.id, shortlisted, +limit, +skip);
    }

    @Roles(["employer", "recruiter"])
    @Patch('/shortlist-candidate')
    async shortListCandidate(@Body() { userId, jobId, value }) {
        return await this.companyService.shortListCandidate(jobId, userId, value);
    }
}
