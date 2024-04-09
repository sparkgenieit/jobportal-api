import { Types } from "mongoose"

export class OrderDto {
    orderId: string
    companyId: Types.ObjectId
    companyName: string
    jobId: Types.ObjectId
    jobTitle: string
    planName: string
    paymentStatus?:string
    created_date?: Date
}

