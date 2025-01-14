import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { User } from "./user.schema";
import { Jobs } from "src/jobs/schema/Jobs.schema";
import { UploadDoc } from "./userProfile.schema";


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
    cv: UploadDoc
    @Prop()
    coverLetter: UploadDoc
    @Prop()
    saved: Boolean
    @Prop()
    saved_date: String
    @Prop()
    applied_date: String
    @Prop()
    shortlisted?: Boolean
}

export const UserJobsSchema = SchemaFactory.createForClass(UserJobs);