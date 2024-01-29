import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    first_name: string
    @Prop()
    last_name: string
    @Prop()
    email: string
    @Prop()
    password: string
    @Prop()
    mobile:number
    @Prop()
    Personalsummary:string
    @Prop()
    jobtittle:string
    @Prop()
    employer:string
    @Prop()
    location:string
    @Prop()
    from: Date
    @Prop()
    to: Date
    @Prop()
    description:string
    @Prop()
    education_provider:string
    @Prop()
    qualification:string
    @Prop()
    year_completed:string
    @Prop()
    valid_in_NZ?:string
    @Prop()
    education_description:string
    @Prop()
    licence_name : string
    @Prop()
    issuing_authority: string
    @Prop()
    issue_date: Date
    @Prop()
    expiry_date: Date
    @Prop()
    validinNZ?: string
    @Prop()
    certificate_name: string
    @Prop()
    certifications_issuing_authority: string
    @Prop()
    certifications_issue_date: Date
    @Prop()
    certifications_expiry_date: Date
    @Prop()
    certifications_validinNZ?: string
    @Prop()
    certifications_description: string
    @Prop()
    skills: string
    @Prop()
    availability: string
    @Prop()
    full_time: string
    @Prop()
    part_time : string
    @Prop()
    causal: string
    @Prop()
    contract: string
    @Prop()
    freelance: string
    @Prop()
    temporary: string
    @Prop()
    preferred_locations: string
    @Prop()
    preferred_job_category: Date
    @Prop()
    expected_rate_per_hour$: number
    @Prop()
    show_profile: string
    @Prop()
    visa_type: string
    @Prop()
    visa_expiry_date: Date
    @Prop()
    upload_cover_letter : string
    @Prop()
    uploadcv: string
}

export const UserSchema = SchemaFactory.createForClass(User);