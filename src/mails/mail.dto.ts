import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

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

export class EmployerMailDto {
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

    @IsOptional()
    @IsString()
    assignedTo?: string
}