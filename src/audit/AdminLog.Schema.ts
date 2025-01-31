import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type AdminLogDocument = HydratedDocument<AdminLog>;

@Schema()
export class AdminLog {

    @Prop({ default: new Date() })
    date?: Date

    @Prop()
    admin_id: string

    @Prop()
    name: string

    @Prop()
    jobId?: string

    @Prop()
    adId?: string

    @Prop()
    employerReference?: string

    @Prop()
    jobTitle?: string

    @Prop()
    fieldName?: string

    @Prop()
    email?: string

    @Prop()
    description?: string

    @Prop()
    changedTo?: string

    @Prop()
    changedFrom?: string
}

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog);
