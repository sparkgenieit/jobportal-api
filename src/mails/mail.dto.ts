import { IsArray, IsNotEmpty, IsString } from "class-validator";

class Chat {
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
    participants: string[]

    @IsArray()
    chat: Chat[]

}