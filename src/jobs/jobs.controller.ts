import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JobsDto } from './dto/jobs.dto';
import { Jobs } from './schema/jobs.schema';
import { JobsService } from './jobs.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('jobs')
export class jobsController {
    constructor(
        private readonly jobsService: JobsService
    ) { }
    @UseGuards(AuthGuard)
    @Post('create')
    async createUserDto(@Body() jobsDto: JobsDto): Promise<Jobs> {
        return await this.jobsService.createJob(jobsDto);
    }
    @UseGuards(AuthGuard)
    @Get("all")
    async getAllAdmins(@Query() { limit, skip, adminName }) {
        return await this.jobsService.getAllJobs(+limit, +skip, adminName)
    }

    @Get("approved")
    async getApprovedjobs(@Query() { limit, skip }) {
        return await this.jobsService.getApprovedJobs(+limit, +skip)
    }

    @Get('suggestions')
    async searchSuggestion(@Query() { searchTerm, searchValue }) {
        return await this.jobsService.searchSuggestions(searchTerm, searchValue);
    }

    @Post("filtered-jobs")
    async getFilterJobs(@Body() data, @Query() { limit, skip }) {
        return await this.jobsService.getFilterJobs(data, +limit, +skip)
    }
    @UseGuards(AuthGuard)
    @Get("queue")
    async getQueuejobs(@Query() { limit, skip }) {
        return await this.jobsService.getQueueJobs(+limit, +skip)
    }
    @UseGuards(AuthGuard)
    @Post('apply')
    async applyJob(@Body() data: { userId: string, jobId: string, applied: boolean, applied_date: string }): Promise<any> {
        return await this.jobsService.applyJob(data);
    }
    @UseGuards(AuthGuard)
    @Post('save')
    async saveJob(@Body() data: { userId: string, jobId: string, saved: boolean, saved_date: string }): Promise<any> {
        return await this.jobsService.saveJob(data);
    }
    @UseGuards(AuthGuard)
    @Post('assign')
    async assignJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.assignJob(data);
    }
    @UseGuards(AuthGuard)
    @Post('release')
    async releaseJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.releaseJob(data);
    }
    @UseGuards(AuthGuard)
    @Post('multi_release')
    async multiReleaseJob(@Body() bodyData: any, response: any): Promise<Jobs> {
        const promises = [];
        bodyData.forEach(async (data: { adminId: string; jobId: string; jobsDto: JobsDto; }) => {
            await this.jobsService.releaseJob(data);
        })
        response = { status: '200' };
        return response;
    }
    @UseGuards(AuthGuard)
    @Post('approve')
    async approveJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.approveJob(data);
    }
    @UseGuards(AuthGuard)
    @Post('reject')
    async rejectJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.rejectJob(data);
    }
    @UseGuards(AuthGuard)
    @Get('assignedJobs/:adminId')
    async getAssignedJobs(@Param() data, @Query() { limit, skip }) {
        return await this.jobsService.getAssignedJobs(data.adminId, limit, skip);
    }

    @UseGuards(AuthGuard)
    @Get('postedJobs/:companyId')
    async getPostedJobs(@Param() data, @Query() { limit, skip, name }) {
        return await this.jobsService.getPostedJobs(data.companyId, +limit, +skip, name);
    }
    @UseGuards(AuthGuard)
    @Get('appliedJobs/:userId')
    async getAppliedJobs(@Param() data, @Query() { limit, skip }): Promise<Jobs[]> {
        return await this.jobsService.getAppliedJobs(data.userId, +limit, +skip);
    }

    @UseGuards(AuthGuard)
    @Get('savedJobs/:userId')
    async getSavedJobs(@Param() data, @Query() { limit, skip }): Promise<Jobs[]> {
        return await this.jobsService.getSavedJobs(data.userId, +limit, +skip);
    }

    @Get('user-job-status/:userId')
    async getUserJobStatus(@Param() { userId }, @Query() { jobId }): Promise<any> {
        return await this.jobsService.getUserJobStatus(userId, jobId);
    }

    @UseGuards(AuthGuard)
    @Put('update/:id')
    async jobsDto(@Param() data, @Body() jobsDto: JobsDto): Promise<Jobs[]> {
        console.log("update jobs id", data.id)
        return await this.jobsService.updateJob(data.id, jobsDto);
    }
    @UseGuards(AuthGuard)
    @Get(':id')
    async getJob(@Param() data): Promise<Jobs[]> {
        console.log(data.id);
        return await this.jobsService.getJob(data.id);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteJob(@Param() data) {
        return await this.jobsService.deleteJob(data.id);
    }
}
