import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContactSerivce } from './contact';
import { ContactDto, EmployerContactDto, JobInquiryDto, Message } from './contact.dto';
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
    async postReply(@Body() data: Message, @Param() { query_id }) {
        return await this.contactService.postReply(query_id, data)
    }

    @UseGuards(AuthGuard)
    @Get('/all-queries/')
    async allQueries(@Query() { s, limit, skip }) {
        return await this.contactService.getAllQueries(s, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Get('/query/:id')
    async getQuery(@Param() { id }, @Query() { type }) {
        return await this.contactService.getQuery(id, type)
    }

    @UseGuards(AuthGuard)
    @Get('/company-queries/:companyId')
    async companyQueries(@Param() data, @Query() { q, limit, skip }) {
        return await this.contactService.getCompanyQueries(data.companyId, q, +limit, +skip)
    }
}
