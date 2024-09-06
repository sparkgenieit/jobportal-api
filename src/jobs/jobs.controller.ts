import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JobsDto } from './dto/jobs.dto';
import { Jobs } from './schema/Jobs.schema';
import { JobsService } from './jobs.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('jobs')
export class jobsController {
    constructor(
        private readonly jobsService: JobsService
    ) { }

    @UseGuards(AuthGuard)
    @Roles(["employer"])
    @Post('create')
    async postJob(@Body() jobsDto: JobsDto): Promise<Jobs> {
        return await this.jobsService.postJob(jobsDto);
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Get("all")
    async getAllJobs(@Query() { limit, skip, adminName }) {
        return await this.jobsService.getAllJobs(+limit, +skip, adminName)
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
    @Roles(["admin"])
    @Get("queue")
    async getQueuejobs(@Query() { limit, skip }) {
        return await this.jobsService.getQueueJobs(+limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Post('apply')
    async applyJob(@Body() data: { userId: string, jobId: string, applied: boolean, applied_date: string }): Promise<any> {
        return await this.jobsService.applyJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Post('save')
    async saveJob(@Body() data: { userId: string, jobId: string, saved: boolean, saved_date: string }): Promise<any> {
        return await this.jobsService.saveJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('assign')
    async assignJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.assignJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('release')
    async releaseJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.releaseJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
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
    @Roles(["admin", "superadmin"])
    @Post('approve')
    async approveJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.approveJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('reject')
    async rejectJob(@Body() data: { adminId: string, jobId: string, jobsDto: JobsDto }): Promise<Jobs> {
        return await this.jobsService.rejectJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Post('report')
    async reportJob(@Body() data: { userId: string, jobId: string, reportReason: string }): Promise<any> {
        return await this.jobsService.reportJob(data);
    }

    @UseGuards(AuthGuard)
    @Roles(["employer"])
    @Patch('close')
    async closeJob(@Body() { userId, jobId }): Promise<any> {
        return await this.jobsService.closeJob(jobId, userId);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('assignedJobs/:adminId')
    async getAssignedJobs(@Param() data, @Query() { limit, skip }) {
        return await this.jobsService.getAssignedJobs(data.adminId, +limit, +skip);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Get('appliedJobs/:userId')
    async getAppliedJobs(@Param() data, @Query() { limit, skip }): Promise<Jobs[]> {
        return await this.jobsService.getAppliedJobs(data.userId, +limit, +skip);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Get('savedJobs/:userId')
    async getSavedJobs(@Param() data, @Query() { limit, skip }): Promise<Jobs[]> {
        return await this.jobsService.getSavedJobs(data.userId, +limit, +skip);
    }


    @Roles(["superadmin"])
    @Put("/refund-credits")
    async refundCredits() {
        return await this.jobsService.refundCredits()
    }

    @Get('user-job-status/:userId')
    async getUserJobStatus(@Param() { userId }, @Query() { jobId }): Promise<any> {
        return await this.jobsService.getUserJobStatus(userId, jobId);
    }

    @UseGuards(AuthGuard)
    @Roles(["employer"])
    @Put('update/:id')
    async jobsDto(@Param() data, @Body() jobsDto: JobsDto): Promise<Jobs[]> {
        console.log("update jobs id", data.id)
        return await this.jobsService.updateJob(data.id, jobsDto);
    }

    @Get(':id')
    async getJob(@Param() data): Promise<Jobs[]> {
        return await this.jobsService.getJob(data.id);
    }

    @UseGuards(AuthGuard)
    @Roles(["employer"])
    @Delete('delete/:id')
    async deleteJob(@Param() data) {
        return await this.jobsService.deleteJob(data.id);
    }


    @Patch('/increase-view-count/:jobId')
    async increaseViewCount(@Param() { jobId }) {
        return await this.jobsService.increaseViewCount(jobId);
    }

    @Get('/job-count/info-details')
    async getJobsCount() {
        return await this.jobsService.getCompaniesInfoAndPostedJobsCount()
    }
}
