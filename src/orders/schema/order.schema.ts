import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    orderId: string
    @Prop()
    companyId: Types.ObjectId
    @Prop()
    companyName: string
    @Prop()
    jobId: Types.ObjectId
    @Prop()
    jobTitle: string
    @Prop()
    planName: string
    @Prop()
    paymentStatus?: string
}

export const OrderSchema = SchemaFactory.createForClass(Order);