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
    subject: string
    name: string
    chat: Message[]
    companyId: string
    organisation: string
    email: string
    enquirer: string
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
