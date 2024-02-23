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
        jobsDto.status = "review";
        return await this.jobsService.createJob(jobsDto);
    }

    @Get("all")
    async getAlljobs():Promise<Jobs[]>{
        return await this.jobsService.getAllJobs()
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
