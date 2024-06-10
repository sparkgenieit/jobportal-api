import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ timestamps: true })
export class Contact {
    @Prop()
    subject: string
    @Prop()
    name: string
    @Prop()
    organisation: string
    @Prop()
    message: string
    @Prop()
    email: string
    @Prop()
    phone: number
}

export const ContactSchema = SchemaFactory.createForClass(Contact);