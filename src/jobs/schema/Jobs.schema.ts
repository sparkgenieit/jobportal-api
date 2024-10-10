import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type JobsDocument = HydratedDocument<Jobs>;

@Schema({ autoIndex: true, timestamps: true })
export class Jobs {
    @Prop()
    jobId: Types.ObjectId
    @Prop()
    companyId: Types.ObjectId
    @Prop()
    company: string
    @Prop()
    companyLogo: string
    @Prop()
    closedate: string
    @Prop()
    creationdate: Date
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
    adminName: string
    @Prop()
    status?: string
    @Prop()
    reportedBy?: Types.ObjectId
    @Prop()
    reportReason?: string
    @Prop()
    views?: number
}

const JobsSchema = SchemaFactory.createForClass(Jobs);

// JobsSchema.index({ '$**': 'text' });

export { JobsSchema };