import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Jobs } from "src/jobs/schema/Jobs.schema";

class Message {
    date: Date
    from: string
    message: string
    by: "Visitor" | "Enquirer" | "Admin"
}

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
    chat?: Message[]
    @Prop()
    email?: string
    @Prop()
    companyId?: string
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Jobs' })
    jobId?: Jobs
    @Prop()
    phone?: number
    @Prop()
    enquirer: string
    @Prop()
    assignedTo?: string
}

export const ContactSchema = SchemaFactory.createForClass(Contact);