import { Types } from "mongoose"

export class CompanyProfileDto {
    user_id: Types.ObjectId
    name: string
    address1: string
    address2: string
    address3: string
    city: string
    postalCode: string
    email: string
    contact: string
    website: string
    logo?: string
    phone: string
    youtubeUrl?: string
    banner?: string
    info?: string
    status?: string
}


export enum CompanyProfileStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    ACTIVE = "active"
}

