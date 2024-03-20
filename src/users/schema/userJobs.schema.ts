import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema()
export class UserJobs{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    userId: Types.ObjectId
    @Prop()
    jobId: Types.ObjectId
    @Prop()
    applied: Boolean
    @Prop()
    saved: Boolean
}

export const UserJobsSchema = SchemaFactory.createForClass(UserJobs);