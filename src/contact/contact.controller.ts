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

}
