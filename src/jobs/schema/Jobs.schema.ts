import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type JobsDocument = HydratedDocument<Jobs>;

@Schema()
export class Jobs {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    user_id: Types.ObjectId
    @Prop()
    company: string
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
    status?: string
}

export const JobsSchema = SchemaFactory.createForClass(Jobs);