import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "src/users/schema/user.schema";

export type LogDocument = HydratedDocument<Log>;

@Schema()
export class Log {

    @Prop({ default: new Date() })
    date?: Date

    @Prop()
    companyId: string

    @Prop()
    companyName: string

    @Prop()
    jobId?: string

    @Prop()
    employerReference?: string

    @Prop()
    jobTitle?: string

    @Prop()
    fieldName?: string

    @Prop()
    email?: string

    @Prop()
    username?: string

    @Prop()
    description?: string

    @Prop()
    changedTo?: string

    @Prop()
    changedFrom?: string

}

export const LogSchema = SchemaFactory.createForClass(Log);