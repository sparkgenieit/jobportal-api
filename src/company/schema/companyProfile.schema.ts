import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/schema/user.schema";
import { CompanyProfileStatus } from "../dto/company-profile.dto";

export type CompanyProfileDocument = HydratedDocument<CompanyProfile>;

@Schema()
export class CompanyProfile {
    @Prop({ type: Date })
    created_date?: Date
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user_id: User
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
    @Prop()
    status: CompanyProfileStatus
}

export const CompanyProfileSchema = SchemaFactory.createForClass(CompanyProfile);