import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type JobsDocument = HydratedDocument<Jobs>;

@Schema({ autoIndex: true, timestamps: true })
export class Jobs {
    @Prop({ required: true })
    companyId: Types.ObjectId

    @Prop({ required: true })
    company: string

    @Prop({ required: true })
    companyLogo: string

    @Prop({ required: true })
    closedate: string

    @Prop({ required: true })
    creationdate: Date

    @Prop({ required: true })
    jobtype: string

    @Prop({ required: true })
    location: string

    @Prop()
    employjobreference: string

    @Prop()
    numberofvacancies: number

    @Prop({ required: true })
    jobTitle: string

    @Prop()
    rateperhour: number

    @Prop()
    salary_type: string

    @Prop()
    duration: string

    @Prop({ required: true })
    jobCategory: string

    @Prop({ required: true })
    subCategory: string

    @Prop()
    weeklyperhour: number
    @Prop()
    benifits: string
    @Prop()
    other_benefits: string
    @Prop()
    training: string
    @Prop()
    description: string
    @Prop()
    employerquestions: string

    @Prop({ required: true })
    employer: string

    @Prop({ required: true })
    posted_by: string

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