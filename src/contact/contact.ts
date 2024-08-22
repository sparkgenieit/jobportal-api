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

    async getAllQueries(search: string, limit: number, skip: number) {
        let query: any = {}

        const searchRegex = new RegExp(search, 'i')

        if (search && search?.trim() !== "") query.$or =
            [
                { subject: { $regex: searchRegex } },
                { "chat.message": { $regex: searchRegex } }
            ]

        const data = await this.contactModel.aggregate([
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
            total: data[0]?.count[0]?.total,
            data: data[0]?.data,
            status: 200
        }

    }

    async getCompanyQueries(companyId: string, searchTerm: string, limit: number, skip: number) {
        const query: any = {
            companyId,
        }

        const searchRegex = new RegExp(searchTerm, 'i')

        if (searchTerm && searchTerm?.trim() !== "") query.$or =
            [
                { subject: { $regex: searchRegex } },
                { "chat.message": { $regex: searchRegex } }
            ]

        const data = await this.contactModel.aggregate([
            {
                $facet: {
                    data: [
                        { $match: query },
                        {
                            $project: {
                                chat: {
                                    $slice: ["$chat", -1]
                                },
                                subject: 1
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
            total: data[0]?.count[0]?.total,
            data: data[0]?.data,
            status: 200
        }
    }


    async getQuery(id: string | Types.ObjectId, type: string) {

        id = new Types.ObjectId(id)

        if (type === "Visitor") return await this.contactModel.findById(id)

        const data = await this.contactModel.aggregate([
            { $match: { _id: id } },
            { $addFields: { company_id: { $toObjectId: "$companyId" } } },
            {
                $lookup: {
                    from: "companyprofiles",
                    localField: 'company_id',
                    foreignField: "user_id",
                    as: "companyprofile"
                }
            },
            {
                $unwind: '$companyprofile'
            },
            {
                $project: {
                    chat: 1,
                    subject: 1,
                    'companyprofile.logo': 1
                }
            },
        ])
        return data[0]
    }
}
