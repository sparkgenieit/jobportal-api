import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
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
    @Roles(["employer", "recruiter"])
    @Post('create')
    async postJob(@Body() jobsDto: JobsDto, @Req() req): Promise<Jobs> {
        return await this.jobsService.postJob(jobsDto, req.user);
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
    async applyJob(@Body() data): Promise<any> {
        return await this.jobsService.applyJob(data.userId, data.jobId, data);
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
    @Roles(["employer", "recruiter"])
    @Patch('close')
    async closeJob(@Body() { userId, jobId }, @Req() req): Promise<any> {
        return await this.jobsService.closeJob(jobId, userId, req.user);
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('assignedJobs')
    async getAssignedJobs(@Query() { limit, skip }, @Req() req) {
        const { id } = req.user
        return await this.jobsService.getAssignedJobs(id, +limit, +skip);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Get('appliedJobs/:userId')
    async getAppliedJobs(@Param("userId") userId, @Query() { limit, skip }): Promise<Jobs[]> {
        return await this.jobsService.getAppliedJobs(userId, +limit, +skip);
    }

    @UseGuards(AuthGuard)
    @Roles(["user"])
    @Get('savedJobs/:userId')
    async getSavedJobs(@Param("userId") userId, @Query() { limit, skip }): Promise<Jobs[]> {
        return await this.jobsService.getSavedJobs(userId, +limit, +skip);
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
    @Roles(["employer", "recruiter"])
    @Put('update/:id')
    async jobsDto(@Param() data, @Body() jobsDto: JobsDto, @Req() req): Promise<Jobs[]> {
        return await this.jobsService.updateJob(data.id, jobsDto, req.user);
    }

    @Get(':id')
    async getJob(@Param() data): Promise<Jobs[]> {
        return await this.jobsService.getJob(data.id);
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Delete('delete/:id')
    async deleteJob(@Req() req) {
        const { id } = req.params
        return await this.jobsService.deleteJob(req.user, id);
    }


    @Patch('/increase-view-count/:jobId')
    async increaseViewCount(@Param() { jobId }) {
        return await this.jobsService.increaseViewCount(jobId);
    }


}
