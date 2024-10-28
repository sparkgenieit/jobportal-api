import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { CompanyProfileDto } from "../dto/company-profile.dto";
import { CompanyProfile } from "./companyProfile.schema";


export type ProfileChangesDocument = HydratedDocument<ProfileChanges>;

@Schema()
export class ProfileChanges {
    @Prop({ type: Date, default: new Date() })
    created_date: Date
    @Prop()
    company_id: string

    @Prop()
    old_profile: CompanyProfile

    @Prop()
    new_profile: CompanyProfileDto

    @Prop()
    assignedTo?: string
}

export const ProfileChangesSchema = SchemaFactory.createForClass(ProfileChanges);