import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Mail } from "./mail.schema";
import { MailDto } from "./mail.dto";

@Injectable()
export class MailService {
    constructor(@InjectModel("Mail") private mailModel: Model<Mail>) { }

    async createMessage(user: any, mailDto: MailDto) {
        mailDto.participants.push(user.id)
        mailDto.chat[0].by = user.role
        mailDto.chat[0].from = user.username
        try {
            await this.mailModel.create(mailDto)
            return { message: "Mail Sent" }
        } catch (error) {
            throw new HttpException({ message: 'Internal Server Error' }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getMails(userid: string) {
        try {
            return await this.mailModel.find({ participants: { $in: userid } })
        } catch (error) {
            throw new HttpException({ message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

}