import { Types } from "mongoose"

 export class CompanyProfileDto{
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
    logo: string
    phone:string
}

