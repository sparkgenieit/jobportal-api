import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AdDocument = HydratedDocument<Ad>;

@Schema()
export class Ad {
    @Prop({ type: Date, default: new Date() })
    created_date?: Date
    @Prop()
    title: string
    @Prop()
    description: string
    @Prop()
    ad_image_url: string
    @Prop()
    ad_type: string
}

export const AdSchema = SchemaFactory.createForClass(Ad);