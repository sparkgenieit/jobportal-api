import { Body, Controller, Get, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { Chat, MailDto } from "./mail.dto";
import { MailService } from "./mail.services";

@Controller('mails')
export class MailController {
    constructor(private readonly mailService: MailService) { }

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


}