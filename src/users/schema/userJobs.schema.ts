import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";
import { Jobs } from "src/jobs/schema/jobs.schema";


@Schema()
export class UserJobs {
    @Prop({ type: Date })
    created_date?: Date
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userId: User
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Jobs.name })
    jobId: Jobs
    @Prop()
    applied: Boolean
    @Prop()
    saved: Boolean
    @Prop()
    saved_date: string
    @Prop()
    applied_date: string
}

export const UserJobsSchema = SchemaFactory.createForClass(UserJobs);