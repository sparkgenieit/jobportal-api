import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { JobsDto } from './dto/jobs.dto';
import { Jobs } from './schema/jobs.schema';
import { JobsService } from './jobs.service';


@Controller('jobs')
export class jobsController {
    constructor(
        private readonly jobsService:JobsService
    ){}

    @Post('create')
    async createUserDto(@Body() jobsDto:JobsDto):Promise<Jobs>{
        return await this.jobsService.createJob(jobsDto);
    }

    @Get("approved")
    async getApprovedjobs():Promise<Jobs[]>{
        return await this.jobsService.getApprovedJobs()
    }

    @Get("queue")
    async getQueuejobs():Promise<Jobs[]>{
        return await this.jobsService.getQueueJobs()
    }

    @Post('assign')
    async assignJob(@Body() data:{adminId:string, jobId:string, jobsDto:JobsDto}):Promise<Jobs>{
        return await this.jobsService.assignJob(data);
    }

    @Post('approve')
    async approveJob(@Body() data:{adminId:string, jobId:string, jobsDto:JobsDto}):Promise<Jobs>{
        return await this.jobsService.approveJob(data);
    }

    @Post('reject')
    async rejectJob(@Body() data:{adminId:string, jobId:string, jobsDto:JobsDto}):Promise<Jobs>{
        return await this.jobsService.rejectJob(data);
    }

    @Get(':adminId')
    async getAssignedJobs(@Param() data):Promise<Jobs[]>{
        return await this.jobsService.getAssignedJobs(data.adminId);
    }


    @Get(':companyId')
    async getPostedJobs(@Param() data):Promise<Jobs[]>{
        return await this.jobsService.getPostedJobs(data.companyId);
    }


    @Put('update/:id')
    async jobsDto(@Param() data, @Body() jobsDto:JobsDto):Promise<Jobs[]>{
       console.log("update jobs id", data.id)
        return await this.jobsService.updateJob(data.id, jobsDto);
    }

    @Get(':id')
    async getJobs(@Param() data):Promise<Jobs[]>{
        console.log(data.id);
        return await this.jobsService.getJob(data.id);
    }
}
