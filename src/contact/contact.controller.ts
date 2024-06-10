import { Body, Controller, Post } from '@nestjs/common';
import { ContactSerivce } from './contact';
import { ContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {

    constructor(private readonly contactService: ContactSerivce) { }

    @Post('contact-us')
    async contactUs(@Body() ContactDto: ContactDto) {
        return await this.contactService.contactUs(ContactDto)
    }

}
