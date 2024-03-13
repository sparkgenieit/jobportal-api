import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type JobsDocument = HydratedDocument<Jobs>;

@Schema()
export class Jobs {
    @Prop()
    jobId: Types.ObjectId
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    companyId: Types.ObjectId
    @Prop()
    company: string
    @Prop()
    companyLogo: string
    @Prop()
    closedate: string
    @Prop()
    creationdate: string
    @Prop()
    jobtype: string
    @Prop()
    location: string
    @Prop()
    employjobreference: string
    @Prop()
    numberofvacancies: number
    @Prop()
    jobTitle: string
    @Prop()
    rateperhour: number
    @Prop()
    duration: string
    @Prop()
    jobCategory: string
    @Prop()
    subCategory: string
    @Prop()
    weeklyperhour: number
    @Prop()
    benifits: string
    @Prop()
    training: string
    @Prop()
    description: string
    @Prop()
    employerquestions: string
    @Prop()
    employer: string
    @Prop()
    adminId: Types.ObjectId
    @Prop()
    status?: string
}

export const JobsSchema = SchemaFactory.createForClass(Jobs);