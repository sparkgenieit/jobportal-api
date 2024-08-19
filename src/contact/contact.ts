import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactDto, EmployerContactDto, JobInquiryDto, Message } from './contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './schema/contact.schema';
import mongoose, { Model, Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class ContactSerivce {
    constructor(private emailService: MailerService, @InjectModel(Contact.name) private contactModel: Model<Contact>) { }

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

    async employerContactUs(employerContactDto: EmployerContactDto) {
        try {
            await this.contactModel.create(employerContactDto);
            return { message: "Thank you for contacting us" }
        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async postReply(query_id, reply: Message) {
        query_id = new Types.ObjectId(query_id)
        try {
            const query = await this.contactModel.updateOne({ _id: query_id }, { $push: { chat: reply } });
            return { message: "Reply posted" }
        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async jobInquiry(jobInquiryDto: JobInquiryDto) {
        try {
            await this.contactModel.create(jobInquiryDto);
            return { message: "We will contact you soon" }
        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAllQueries(type: string, search: string, limit: number, skip: number) {
        let query: any = {}

        const searchTerm = new RegExp(search, 'i');

        if (type && type.trim() !== "") {
            query.enquirer = type
        }
        if (search && search.trim() !== "") {
            query.$or = [
                { name: searchTerm },
                { organisation: searchTerm }
            ]
        }

        const data = await this.contactModel.aggregate([
            {
                $facet: {
                    data: [
                        { $match: query },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    count: [{ $match: query }, { $count: 'total' }]
                }
            }
        ])

        return {
            total: data[0].count[0].total,
            data: data[0].data,
            status: 200
        }

    }

    async getCompanyQueries(companyId: string, limit: number, skip: number) {
        const query = {
            companyId,
        }
        const data = await this.contactModel.aggregate([
            {
                $facet: {
                    data: [
                        { $match: query },
                        { $sort: { updatedAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    count: [{ $match: query }, { $count: 'total' }]
                }
            }
        ])

        return {
            total: data[0]?.count[0]?.total,
            data: data[0]?.data,
            status: 200
        }
    }
}
