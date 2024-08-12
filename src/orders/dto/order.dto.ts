import { Types } from "mongoose"

export class OrderDto {
    created_date?: Date
    companyId: Types.ObjectId
    description: string
    amount?: number
    invoiceNumber?: number
    credits: number
    creditsPurchased?: number
    creditsUsed?: number
}

