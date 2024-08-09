import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContactSerivce } from './contact';
import { ContactDto, EmployerContactDto, JobInquiryDto } from './contact.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('contact')
export class ContactController {

    constructor(private readonly contactService: ContactSerivce) { }

    @Post('contact-us')
    async contactUs(@Body() contactData: ContactDto) {
        return await this.contactService.contactUs(contactData)
    }

    @UseGuards(AuthGuard)
    @Post('/employer/query')
    async contactUsEmployer(@Body() employerContactData: EmployerContactDto) {
        return await this.contactService.employerContactUs(employerContactData)
    }

    @UseGuards(AuthGuard)
    @Post('/job/query')
    async jobInquiry(@Body() jobInquiryData: JobInquiryDto) {
        return await this.contactService.jobInquiry(jobInquiryData)
    }

    @UseGuards(AuthGuard)
    @Patch('/query/reply/:query_id')
    async postReply(@Body() { reply }, @Param() { query_id }) {
        return await this.contactService.postReply(query_id, reply)
    }

    @UseGuards(AuthGuard)
    @Get('/all-queries/')
    async allQueries(@Query() { t, s, limit, skip }) {
        return await this.contactService.getAllQueries(t, s, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Get('/company-queries/:companyId')
    async companyQueries(@Param() data, @Query() { limit, skip }) {
        return await this.contactService.getCompanyQueries(data.companyId, +limit, +skip)
    }
}
