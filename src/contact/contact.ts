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

    async postReply(queryId: string, reply: Message) {
        const query_id: Types.ObjectId = new Types.ObjectId(queryId)
        try {
            const query = await this.contactModel.updateOne({ _id: query_id }, { $push: { chat: reply } });
            return { message: "Reply posted" }
        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getUnAssignedQueries(search: string, limit: number, skip: number) {
        let query: any = {
            $and: [
                {
                    $or: [
                        { assignedTo: null },
                        { assignedTo: { $regex: /^$/ } } // Matches empty strings
                    ]
                },

            ]
        }

        const searchRegex = new RegExp(search, 'i')

        if (search && search?.trim() !== "") {
            const searchQuery = {
                $or:
                    [
                        { organisation: { $regex: searchRegex } },
                        { subject: { $regex: searchRegex } },
                        { "chat.message": { $regex: searchRegex } }
                    ]
            }
            query.$and.push(searchQuery)
        }

        try {
            const response = await this.contactModel.aggregate([
                {
                    $facet: {
                        data: [
                            { $match: query },
                            {
                                $addFields: {
                                    chat: {
                                        $slice: ["$chat", -1]
                                    },
                                }
                            },
                            { $sort: { createdAt: 1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        count: [{ $match: query }, { $count: 'total' }]
                    }
                }
            ])

            return {
                total: response[0]?.count[0]?.total,
                queries: response[0]?.data,
                status: 200
            }

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

    async assignQuery(user_id: string, queryId: string) {
        const query_id: Types.ObjectId = new Types.ObjectId(queryId)
        try {
            await this.contactModel.updateOne({ _id: query_id }, { assignedTo: user_id })
            return { message: "Query Assinged" }
        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAssignedQueries(userId: string, search: string, limit: number, skip: number) {
        let query: any = {
            assignedTo: userId
        }
        const searchRegex = new RegExp(search, 'i')
        if (search && search?.trim() !== "") {
            query.$or =
                [
                    { organisation: { $regex: searchRegex } },
                    { subject: { $regex: searchRegex } },
                    { "chat.message": { $regex: searchRegex } }
                ]
        }
        return await this.getQueries(query, limit, skip)
    }

    async getQueries(query: any, limit: number, skip: number) {
        try {
            const response = await this.contactModel.aggregate([
                {
                    $facet: {
                        data: [
                            { $match: query },
                            {
                                $addFields: {
                                    chat: {
                                        $slice: ["$chat", -1]
                                    },
                                }
                            },
                            { $sort: { updatedAt: -1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        count: [{ $match: query }, { $count: 'total' }]
                    }
                }
            ])

            return {
                total: response[0]?.count[0]?.total,
                data: response[0]?.data,
                status: 200
            }
        } catch (e) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getCompanyQueries(companyId: string, search: string, limit: number, skip: number) {
        const query: any = {
            companyId,
        }

        const searchRegex = new RegExp(search, 'i')
        if (search && search?.trim() !== "") {
            query.$or =
                [
                    { subject: { $regex: searchRegex } },
                    { "chat.message": { $regex: searchRegex } }
                ]
        }


        return await this.getQueries(query, limit, skip)
    }


    async getQuery(id: string | Types.ObjectId, type: string) {
        id = new Types.ObjectId(id)
        try {
            return await this.contactModel.findById(id)
        } catch (e) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}
