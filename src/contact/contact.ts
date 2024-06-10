import { Injectable } from '@nestjs/common';
import { ContactDto } from './contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './schema/contact.schema';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class ContactSerivce {
    constructor(private emailService: MailerService, @InjectModel(Contact.name) private contactModel: Model<Contact>) { }

    async contactUs(ContactDto: ContactDto) {
        try {
            await this.contactModel.create(ContactDto);
            await this.emailService.sendMail({
                to: ContactDto.email,
                subject: `[${process.env.APP_NAME}] Email Confirmation`,
                // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
                template: 'user/contact_us',
                context: {
                    name: `${ContactDto.name}`,
                },
            });
            return { message: "Thank you for Contacting Us" }
        }
        catch (error) {
            console.log(error)
            return { message: "An error ocuured" }

        }
    }




}
