import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
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
    new_profile: CompanyProfile

    @Prop()
    assignedTo?: string
}

export const ProfileChangesSchema = SchemaFactory.createForClass(ProfileChanges);