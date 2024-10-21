import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type LogDocument = HydratedDocument<Log>;

@Schema()
export class Log {

    @Prop({ default: new Date() })
    date?: Date

    @Prop()
    user_id: string

    @Prop()
    name: string

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

const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ "$**": "text" })

export { LogSchema }