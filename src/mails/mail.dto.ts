import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class Chat {
    @IsNotEmpty()
    date: Date

    @IsNotEmpty()
    @IsString()
    from: string

    @IsNotEmpty()
    @IsString()
    message: string

    @IsString()
    @IsNotEmpty()
    by: string
}

export class MailDto {
    @IsNotEmpty()
    @IsString()
    subject: string

    @IsArray()
    @IsNotEmpty()
    participants: string[]

    @ValidateNested({ each: true })
    @Type(() => Chat)
    chat: Chat[]

    readBy: string[]
}