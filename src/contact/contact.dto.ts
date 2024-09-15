import { IsEmail, IsNotEmpty } from "class-validator"
import { Types } from "mongoose"

export class Message {
    date: Date
    from: string
    message: string
    by: "Visitor" | "Enquirer" | "Admin"
}

export class ContactDto {
    subject: string
    name: string
    organisation: string
    message: string
    email: string
    phone: number
    enquirer: string
}


export class EmployerContactDto {
    @IsNotEmpty()
    subject: string

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    chat: Message[]

    @IsNotEmpty()
    companyId: string

    @IsNotEmpty()
    organisation: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    enquirer: string

    assignedTo?: string
}


export class JobInquiryDto {
    subject: string
    name: string
    chat: Message[]
    organisation: string
    companyId: string
    jobId: Types.ObjectId
    enquirer: string
}
