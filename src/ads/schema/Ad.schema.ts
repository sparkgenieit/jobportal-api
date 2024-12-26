import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AdDocument = HydratedDocument<Ad>;

@Schema()
export class Ad {
    @Prop({ type: Date, default: new Date() })
    created_date?: Date
    @Prop({ required: true })
    title: string
    @Prop({ required: true })
    description: string
    @Prop({ required: true })
    ad_image_url: string
    @Prop({ required: true })
    ad_type: string
    @Prop({ required: true })
    redirect_url: string
    @Prop({ required: true })
    posted_by: string
    @Prop()
    company_id: string
}

export const AdSchema = SchemaFactory.createForClass(Ad);