import { Types } from "mongoose"

export class OrderDto {
    created_date?: Date
    companyId: Types.ObjectId
    description: string
    amount?: number
    invoiceNumber?: string
    credits: number
    creditsPurchased?: number
    creditsUsed?: number
}

