import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
    @Prop()
    userId: Types.ObjectId
    @Prop()
    jobId: Types.ObjectId
    @Prop({ default: Date.now() })
    createdAt: Date
    @Prop()
    message: string
    @Prop()
    status: string
    @Prop()
    isRead: boolean
}

export const NotificationsSchema = SchemaFactory.createForClass(Notification);