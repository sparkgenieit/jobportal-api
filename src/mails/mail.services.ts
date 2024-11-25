import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Chat, EmployerMailDto, MailDto } from "./mail.dto";
import { Mail } from "./schema/mail.schema";
import { EmployerMail } from "./schema/employerMail.schema";
import { CompanyProfile } from "src/company/schema/companyProfile.schema";
import { CompanyProfileDto } from "src/company/dto/company-profile.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { ENV } from "src/utils/functions";

@Injectable()
export class MailService {
    constructor(
        @InjectModel("Mail") private mailModel: Model<Mail>,
        @InjectModel("EmployerMail") private employerMailModel: Model<EmployerMail>,
        @InjectModel("CompanyProfile") private companyProfileModel: Model<CompanyProfile>,
        private emailService: MailerService
    ) { }

    async contactUsMail(mail: EmployerMailDto, token: string) {
        const secretKey = ENV.CAPTCHA_SECRET_KEY
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, { method: "POST" })

        const result = await response.json()

        if (!result.success) {
            throw new HttpException({ message: "Please re-verify the captcha" }, HttpStatus.UNPROCESSABLE_ENTITY)
        }

        try {
            await this.employerMailModel.create(mail)
            return { message: "Mail Sent" }
        } catch (error) {
            throw new HttpException({ message: 'Something went wrong! Please try again' }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    //Admin - Admin Methods

    async createMessage(user: any, mailDto: MailDto) {
        mailDto.participants.push(user.id)
        mailDto.chat[0].by = user.role
        mailDto.chat[0].from = user.username
        mailDto.readBy = [user.id]
        try {
            await this.mailModel.create(mailDto)
            return { message: "Mail Sent" }
        } catch (error) {
            throw new HttpException({ message: 'Something went wrong! Please try again' }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getMails(userid: string, search: string, limit: number, skip: number) {
        const query: any = {
            participants: { $in: [userid] }
        }
        const searchRegex = new RegExp(search, 'i')
        if (search && search?.trim() !== "") {
            query.$or =
                [
                    { subject: { $regex: searchRegex } },
                    { "chat.message": { $regex: searchRegex } },
                    { "chat.from": { $regex: searchRegex } }
                ]
        }
        try {
            const response = await this.mailModel.aggregate([
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
                mails: response[0]?.data,
                status: 200
            }

        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    async postReply(_id: string | Types.ObjectId, user: any, data: Chat) {
        _id = new Types.ObjectId(_id)
        try {
            data.from = user.username
            data.by = user.role
            return await this.mailModel.updateOne({ _id, participants: { $in: user.id } }, { $push: { chat: data }, readBy: [user.id] })
        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getMail(id: string, userid: string) {
        const query = {
            _id: id,
            participants: { $in: userid }
        }
        try {
            const res = await this.mailModel.findOneAndUpdate(query, { $addToSet: { readBy: userid } }, { new: true })
            return res
        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

    async unreadMails(id: string) {
        try {
            const unreadCount = await this.mailModel.countDocuments({ participants: { $in: id }, readBy: { $nin: id } })
            return unreadCount
        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }



    //Employer - Admin Methods

    async createEmployerMail(mail: EmployerMailDto) {
        try {
            await this.employerMailModel.create(mail)
            return { message: "Mail Sent" }
        } catch (error) {
            throw new HttpException({ message: 'Something went wrong! Please try again' }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getEmployerMails(userid: string, search: string, limit: number, skip: number) {
        const query: any = {
            participants: { $in: [userid] }
        }
        const searchRegex = new RegExp(search, 'i')
        if (search && search?.trim() !== "") {
            query.$or =
                [
                    { subject: { $regex: searchRegex } },
                    { "chat.message": { $regex: searchRegex } },
                    { "chat.from": { $regex: searchRegex } }
                ]
        }
        try {
            const response = await this.employerMailModel.aggregate([
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
                mails: response[0]?.data,
                status: 200
            }

        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getEmployerMail(id: string, userid: string) {
        const query = {
            _id: id,
            participants: { $in: userid }
        }
        try {
            const res = await this.employerMailModel.findOneAndUpdate(query, { $addToSet: { readBy: userid } }, { new: true })
            return res
        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async postReplyEmployer(_id: string | Types.ObjectId, user: any, data: Chat) {
        _id = new Types.ObjectId(_id)
        try {
            const contact: EmployerMailDto = await this.employerMailModel.findOne({ _id })

            if (contact.participants?.includes("Visitor")) {
                await this.sendReplyMail(contact, data)
            }

            if (contact.assignedTo === "Super Admin") {
                contact.assignedTo = ""
            }
            return await this.employerMailModel.updateOne({ _id, participants: { $in: user.id } }, { $push: { chat: data }, readBy: [user.id], assignedTo: contact.assignedTo })
        } catch (error) {
            console.log(error);
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async unreadMailsEmployer(id: string) {
        try {
            const unreadCount = await this.employerMailModel.countDocuments({ participants: { $in: id }, readBy: { $nin: id } })
            return unreadCount
        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    async getUnAssignedQueries(search: string, limit: number, skip: number, type: string = "general") {
        let query: any = {
            $and: [
                {
                    $or: [
                        { assignedTo: null },
                        { assignedTo: { $regex: /^$/ } } // Matches empty strings
                    ]
                },
                { participants: type === "general" ? { $in: ["Visitor"] } : { $nin: ["Visitor"] } }
            ]
        }

        const searchRegex = new RegExp(search, 'i')

        if (search && search?.trim() !== "") {
            const searchQuery = {
                $or:
                    [
                        { "chat.from": { $regex: searchRegex } },
                        { subject: { $regex: searchRegex } },
                        { "chat.message": { $regex: searchRegex } }
                    ]
            }
            query.$and.push(searchQuery)
        }

        try {
            const response = await this.employerMailModel.aggregate([
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
                mails: response[0]?.data,
                status: 200
            }

        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async assignQuery(user_id: string, queryId: string) {
        const _id = new Types.ObjectId(queryId)
        try {
            await this.employerMailModel.updateOne({ _id }, { assignedTo: user_id, $push: { participants: user_id } })
            return { message: "Query Assinged" }
        } catch (error) {
            throw new HttpException({ message: "Internal Server Error" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async mailAllEmployers(message: string, subject: string) {

        const companies: CompanyProfileDto[] = await this.companyProfileModel.find({}, { user_id: 1 })

        const sendingMessages: EmployerMailDto[] = companies.map(company => {
            const id = company.user_id.toString()
            return ({
                subject,
                participants: [id],
                chat: [
                    {
                        date: new Date(),
                        from: "Super Admin",
                        message,
                        by: "admin",
                    }
                ],
                readBy: [],
                assignedTo: "Super Admin"
            })
        })

        await this.employerMailModel.insertMany(sendingMessages, { ordered: false })
    }

    async deleteMail(id: string) {
        await this.employerMailModel.deleteOne({ _id: id })
        return { message: "Mail deleted" }
    }


    // Sending reply to the visitor 
    async sendReplyMail(contact: EmployerMailDto, reply: Chat) {
        await this.emailService.sendMail({
            to: contact.chat[0].by,
            subject: contact.subject,
            // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
            template: 'user/contact_us',
            context: {
                message: reply.message,
                name: contact.chat[0].from
            },
        })
    }
}