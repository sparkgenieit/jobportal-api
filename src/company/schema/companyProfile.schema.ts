import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CompanyProfileDocument = HydratedDocument<CompanyProfile>;

@Schema()
export class CompanyProfile {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    user_id: Types.ObjectId
    @Prop()
    name: string
    @Prop()
    phone: string
    @Prop()
    address1: string
    @Prop()
    address2: string
    @Prop()
    address3: string
    @Prop()
    city: string
    @Prop()
    postalCode: string
    @Prop()
    email: string
    @Prop()
    contact: string
    @Prop()
    website: string
    @Prop()
    logo?: string
    @Prop()
    youtubeUrl?: string
    @Prop()
    banner?: string
    @Prop()
    info?: string
}

export const CompanyProfileSchema = SchemaFactory.createForClass(CompanyProfile);