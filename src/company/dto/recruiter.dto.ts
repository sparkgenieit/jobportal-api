import { IsEmail, IsNotEmpty } from "class-validator"
import { Types } from "mongoose"

export class RecruiterDto {
    @IsNotEmpty()
    companyId: Types.ObjectId

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    @IsEmail()
    email: string
}

