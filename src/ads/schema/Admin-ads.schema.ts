import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

// Define the Admin Ad document type
export type AdminAdDocument = HydratedDocument<AdminAds>;

@Schema()
export class AdminAds {
    @Prop({ type: Date, default: Date.now })
    creationdate?: Date;

    @Prop({
        required: function (this: AdminAds) {
            return !this.ad_client; // Required only if ad_client is empty
        }
    })
    title: string;

  

    @Prop({
        required: function (this: AdminAds) {
            return !this.ad_client;
        }
    })
    ad_image_url: string;

    @Prop({
        required: function (this: AdminAds) {
            return !this.ad_client;
        }
    })
    redirect_url: string;

    @Prop({ required: true, enum: ['short', 'long', 'home-page-banner', 'landing-page-popup', 'category-page-ad-1', 'category-page-ad-2', 'category-page-ad-3'] })
    ad_type: 'short' | 'long' | 'home-page-banner' | 'landing-page-popup' | 'category-page-ad-1' | 'category-page-ad-2' | 'category-page-ad-2';

    @Prop({ required: false })
    ad_client?: string; // Optional Google Ad Client ID

    @Prop({ required: false })
    ad_slot?: string; // Optional Google Ad Client ID
}

export const AdminAdsSchema = SchemaFactory.createForClass(AdminAds);
