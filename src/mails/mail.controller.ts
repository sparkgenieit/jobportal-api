import { Body, Controller, Get, Patch, Post, Put, Query, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { Chat, EmployerMailDto, MailDto } from "./mail.dto";
import { MailService } from "./mail.services";

@Controller('mails')
export class MailController {
    constructor(private readonly mailService: MailService) { }


    @Post('/contact-us')
    async ContactUsMail(@Body(ValidationPipe) mailDto: EmployerMailDto) {
        return await this.mailService.createEmployerMail(mailDto)
    }

    // Admin to Admin Mail Routes

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Post('/create')
    async createMail(@Body(ValidationPipe) mailDto: MailDto, @Request() req) {
        return await this.mailService.createMessage(req.user, mailDto)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Get('/all')
    async getMails(@Request() req) {
        const { id } = req.user
        const { limit, skip, q } = req.query
        return await this.mailService.getMails(id, q, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Get('/details/:mailId')
    async getMail(@Request() req) {
        const { id } = req.user
        const { mailId } = req.params
        return await this.mailService.getMail(mailId, id)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Put('/reply/:mailId')
    async postReply(@Body(ValidationPipe) data: Chat, @Request() req) {
        const { mailId } = req.params
        return await this.mailService.postReply(mailId, req.user, data)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "superadmin"])
    @Get('/unread-mails')
    async unreadMails(@Request() req) {
        const { id } = req.user
        return await this.mailService.unreadMails(id)
    }


    // Employer - Admin Mail routes

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter", "superadmin"])
    @Post('/employer/create')
    async createEmployerMail(@Body(ValidationPipe) mailDto: EmployerMailDto) {
        return await this.mailService.createEmployerMail(mailDto)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "employer", "recruiter"])
    @Get('/employer/all')
    async getEmployerMails(@Request() req) {
        const { id } = req.user
        const { limit, skip, q } = req.query
        return await this.mailService.getEmployerMails(id, q, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "employer", "recruiter"])
    @Get('/employer/details/:mailId')
    async getEmployerMail(@Request() req) {
        const { id } = req.user
        const { mailId } = req.params
        return await this.mailService.getEmployerMail(mailId, id)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "employer", "recruiter"])
    @Put('/employer/reply/:mailId')
    async postReplyEmployer(@Body(ValidationPipe) data: Chat, @Request() req) {
        const { mailId } = req.params
        return await this.mailService.postReplyEmployer(mailId, req.user, data)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin", "employer", "recruiter"])
    @Get('/employer/unread-mails')
    async unreadMailsEmployer(@Request() req) {
        const { id } = req.user
        return await this.mailService.unreadMailsEmployer(id)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Get('/unassigned-mails')
    async getUnAssignedMails(@Query() { s: searchedTerm, limit, skip }) {
        return await this.mailService.getUnAssignedQueries(searchedTerm, +limit, +skip)
    }

    @UseGuards(AuthGuard)
    @Roles(["admin"])
    @Patch('/assign-mail')
    async assignQuery(@Request() req) {
        const { id } = req.user
        const { query_id } = req.query
        return await this.mailService.assignQuery(id, query_id)
    }

    @UseGuards(AuthGuard)
    @Roles(["superadmin"])
    @Post('/mail-all-employers')
    async MailAllEmployers(@Body() data: { message: string, subject: string }) {
        return await this.mailService.mailAllEmployers(data.message, data.subject)
    }

}