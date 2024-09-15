import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ContactSerivce } from './contact';
import { ContactDto, EmployerContactDto, JobInquiryDto, Message } from './contact.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('contact')
export class ContactController {

    constructor(private readonly contactService: ContactSerivce) { }

    @Post('contact-us')
    async contactUs(@Body() contactData: ContactDto) {
        return await this.contactService.contactUs(contactData)
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter", "superadmin"])
    @Post('/employer/query')
    async contactUsEmployer(@Body(ValidationPipe) employerContactData: EmployerContactDto) {
        return await this.contactService.employerContactUs(employerContactData)
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Post('/job/query')
    async jobInquiry(@Body() jobInquiryData: JobInquiryDto) {
        return await this.contactService.jobInquiry(jobInquiryData)
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "admin", "recruiter"])
    @Patch('/query/reply/:query_id')
    async postReply(@Body() data: Message, @Param() { query_id }) {
        return await this.contactService.postReply(query_id, data)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('/assigned-queries')
    async getAssignedQueries(@Request() req) {
        const { s, limit, skip } = req.query
        const { id } = req.user
        return await this.contactService.getAssignedQueries(id, s, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('/unassigned-queries')
    async getUnAssignedQueries(@Query() { s: searchedTerm, limit, skip }) {
        return await this.contactService.getUnAssignedQueries(searchedTerm, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Patch('/assign-query')
    async assignQuery(@Request() req) {
        const { id } = req.user
        const { query_id } = req.query
        return await this.contactService.assignQuery(id, query_id)
    }


    @UseGuards(AuthGuard)
    @Roles(["employer", "admin", "recruiter"])
    @Get('/query/:id')
    async getQuery(@Param() { id }, @Query() { type }) {
        return await this.contactService.getQuery(id, type)
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Get('/company-queries/:companyId')
    async companyQueries(@Param() data, @Query() { q: searchedTerm, limit, skip }) {
        return await this.contactService.getCompanyQueries(data.companyId, searchedTerm, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Post('/mail-all-employers')
    async MailAllEmployers(@Body() data: { message: string, subject: string }) {
        return await this.contactService.mailAllEmployers(data.message, data.subject)
    }
}
