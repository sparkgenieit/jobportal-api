import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AdDocument = HydratedDocument<Ad>;

@Schema()
export class Ad {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    title: string
    @Prop()
    description: string
    @Prop()
    pages: string
    @Prop()
    position: string
    @Prop()
    size: string
    @Prop()
    price: string
    @Prop()
    noOfClicks: string
    @Prop()
    status?: string
}

export const AdSchema = SchemaFactory.createForClass(Ad);