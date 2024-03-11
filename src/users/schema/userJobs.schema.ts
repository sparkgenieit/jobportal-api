import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema()
export class UserJobs{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    user_id: Types.ObjectId
    @Prop()
    jobId: string
    @Prop()
    type: string
   
}

export const UserJobsSchema = SchemaFactory.createForClass(UserJobs);