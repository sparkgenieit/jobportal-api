import { Types } from "mongoose"

export class OrderDto {
    orderId: string
    companyId: Types.ObjectId
    credits:number
    planName: string
    paymentStatus?:string
    created_date?: Date
}

