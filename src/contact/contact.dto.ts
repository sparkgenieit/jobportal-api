import { Types } from "mongoose";

export class ContactDto {
    subject: string
    name: string
    organisation: string
    message: string
    email: string
    phone: number
}

