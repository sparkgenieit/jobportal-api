import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { AdminAdsDto } from "../dto/admin-ads.dto";  // Assuming you have the DTO in this path

// Define the Admin Ad document type
export type AdminAdDocument = HydratedDocument<AdminAds>;

@Schema()
export class AdminAds {

    
    @Prop({ type: Date, default: Date.now, required: false })  // Ensure it's optional
    creationdate?: Date; // Use `?` to indicate optional field

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    ad_image_url: string;  // Image URL for the ad

    @Prop({ required: true, enum: ['short', 'long','above-menu',  'landing-page'] })  // Ad type validation for 'short' or 'long'
    ad_type: 'short' | 'long' | 'above-menu' | 'landing-page';

    @Prop({ required: true })
    redirect_url: string;  // URL to redirect to when clicked


}

export const AdminAdsSchema = SchemaFactory.createForClass(AdminAds);
