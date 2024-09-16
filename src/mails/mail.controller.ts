import { Body, Controller, Get, Post, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { MailDto } from "./mail.dto";
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
        return await this.mailService.getMails(id)
    }


}