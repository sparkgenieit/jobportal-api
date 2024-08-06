import { Types } from "mongoose"

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
    message: string
    organisation: string
    email: string
    reply?: string
    enquirer: string
}


export class JobInquiryDto {
    subject: string
    name: string
    message: string
    organisation: string
    jobId: Types.ObjectId
    reply?: string
    enquirer: string
}
