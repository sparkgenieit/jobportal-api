import { Types } from "mongoose"

export class AdDto {
    title: string
    description: string
    position: string
    pages: string
    size:string
    price:string
    noOfClicks:string
    created_date?: Date
    status?: string
}

