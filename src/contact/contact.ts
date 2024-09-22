import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactDto, EmployerContactDto, JobInquiryDto, Message } from './contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './schema/contact.schema';
import { Model, Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';


@Injectable()
export class ContactSerivce {
    constructor(private emailService: MailerService,
        @InjectModel(Contact.name) private contactModel: Model<Contact>,
        @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
    ) { }

    async contactUs(contactDto: ContactDto) {
        try {
            await Promise.all([
                this.contactModel.create(contactDto),
                this.emailService.sendMail({
                    to: contactDto.email,
                    subject: `[${process.env.APP_NAME}] Email Confirmation`,
                    // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
                    template: 'user/contact_us',
                    context: {
                        name: `${contactDto.name}`,
                    },
                })
            ])
            return { message: "Thank you for contacting us" }
        }
        catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }



}
