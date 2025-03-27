import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { AdStatus, AdTypes } from "../dto/company-ads.dto";
import { User } from "src/users/schema/user.schema";

export type AdDocument = HydratedDocument<Ads>;

@Schema()
export class Ads {

    @Prop({ type: Date, default: Date.now, required: false })  // Ensure it's optional
    creationdate?: Date; // Use `?` to indicate optional field
    
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop()
    location: string;

    
    @Prop()
    category: string;

    @Prop()
    start_date: Date

    @Prop()
    end_date: Date

    @Prop({ required: true })
    status: AdStatus

    @Prop({ required: true })
    redirect_url: string

    @Prop({ required: true })
    image: string

    @Prop({ required: true })
    type: AdTypes

    @Prop()
    show_on_pages: [string]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    company_id: User

    @Prop({ required: true })
    created_by: string

    @Prop()
    booked_dates: [string]

    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    adminId: User

   

}

export const AdsSchema = SchemaFactory.createForClass(Ads);