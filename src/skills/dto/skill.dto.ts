import { Types } from "mongoose"

export class SkillDto {
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

