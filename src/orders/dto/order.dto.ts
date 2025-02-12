import { IsNotEmpty, IsNumber, IsOptional } from "class-validator"
import { Types } from "mongoose"

export class OrderDto {
    created_date?: Date

    @IsNotEmpty()
    companyId: Types.ObjectId

    @IsNotEmpty()
    description: string

    @IsNumber()
    amount?: number

    @IsOptional()
    @IsNumber()
    invoiceNumber?: number

    @IsNumber()
    @IsNotEmpty()
    credits: number

    @IsNumber()
    @IsNotEmpty()
    creditType: string


    @IsOptional()
    @IsNumber()
    creditsPurchased?: number

    @IsOptional()
    @IsNumber()
    creditsUsed?: number
}

