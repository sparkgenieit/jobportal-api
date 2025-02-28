import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

class WorkHistory {
    jobTitle: string;
    employer: string;
    location: string;
    fromDate: Date;
    toDate: Date;
    description: string;
}

class Education {
    provider: string;
    qualification: string;
    completedYear: string;
    validInNz: string;
    description: string;
}

class Licence {
    name: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate: Date;
    validInNz: string;
    description: string;
}

class Certificate {
    name: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate: Date;
    validInNz: string;
    description: string;
}

export class UploadDoc {
    filename: string;
    originalname: string;
    uploaddate: Date;
}

export type UserDocument = HydratedDocument<UserProfile>;

@Schema()
export class UserProfile {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    user_id: Types.ObjectId
    @Prop()
    first_name: string
    @Prop()
    last_name: string
    @Prop()
    email: string
    @Prop()
    phone?: number
    @Prop()
    profile_summary?: string
    @Prop()
    work_history?: Array<WorkHistory>
    @Prop()
    education?: Array<Education>
    @Prop()
    licences?: Array<Licence>
    @Prop()
    certification?: Array<Certificate>
    @Prop()
    skills?: Array<string>
    @Prop()
    availability?: string
    @Prop()
    noticePeriod?: string
    @Prop()
    preferredJobTypes?: Array<string>
    @Prop()
    preferredJobLocations?: Array<string>
    @Prop()
    preferredJobCategories?: Array<string>
    @Prop()
    expectedRatePerHour?: number
    @Prop()
    visaType?: string
    @Prop()
    visaExpiryDate?: Date
    @Prop()
    cv?: UploadDoc
    @Prop()
    showProfile?: string
    @Prop()
    coverLetter?: UploadDoc
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);