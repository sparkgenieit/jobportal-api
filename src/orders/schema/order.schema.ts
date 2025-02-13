import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
    @Prop({ type: Date, default: Date.now })
    created_date?: Date

    @Prop()
    companyId: Types.ObjectId

    @Prop()
    description: string

    @Prop()
    amount?: number

    @Prop()
    invoiceNumber?: string

    @Prop()
    credits: number
    @Prop()
    creditType?: string

    @Prop()
    creditsPurchased?: number

    @Prop()
    creditsUsed?: number
}

export const OrderSchema = SchemaFactory.createForClass(Order);