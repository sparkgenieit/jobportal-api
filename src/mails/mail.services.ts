import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Mail } from "./mail.schema";
import { Chat, MailDto } from "./mail.dto";

@Injectable()
export class MailService {
    constructor(@InjectModel("Mail") private mailModel: Model<Mail>) { }

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

    async unreadMails(id: string) {
        try {
            const unreadCount = await this.mailModel.countDocuments({ participants: { $in: id }, readBy: { $nin: id } })
            return unreadCount
        } catch (error) {
            throw new HttpException({ message: "Something went wrong! Please try again" }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}