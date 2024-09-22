import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

class Chat {
    date: Date
    from: string
    message: string
    by: string
}

export type EmployerMailDocument = HydratedDocument<EmployerMail>;

@Schema({ timestamps: true })
export class EmployerMail {
    @Prop()
    subject: string
    @Prop()
    participants: string[]
    @Prop()
    chat?: Chat[]
    @Prop()
    readBy: string[]
    @Prop()
    assignedTo: string
}

export const EmployerMailSchema = SchemaFactory.createForClass(EmployerMail);