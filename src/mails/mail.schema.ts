import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

class Chat {
    date: Date
    from: string
    message: string
    by: string
}

export type MailDocument = HydratedDocument<Mail>;

@Schema({ timestamps: true })
export class Mail {
    @Prop()
    subject: string
    @Prop()
    participants: string[]
    @Prop()
    chat?: Chat[]
}

export const MailSchema = SchemaFactory.createForClass(Mail);