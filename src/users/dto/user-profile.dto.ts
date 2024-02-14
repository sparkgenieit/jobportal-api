import { Types } from "mongoose";

class WorkHistory{
    jobTitle:string;
    employer:string;
    location:string;
    fromDate: Date;
    toDate: Date;
    description: string;
}

class Education{
    provider:string;
    qualification:string;
    completedYear:string;
    validInNz: string;
    description: string;
}

class Licence{
    name:string;
    issuingAuthority:string;
    issueDate:Date;
    expiryDate:Date;
    validInNz: string;
    description: string;
}

class Certificate{
    name:string;
    issuingAuthority:string;
    issueDate:Date;
    expiryDate:Date;
    validInNz: string;
    description: string;
}

export class UserProfileDto{
    user_id: Types.ObjectId
    first_name: string
    last_name: string
    email: string
    phone?: number
    profile_summary?: string
    work_history?: Array<WorkHistory>
    education?: Array<Education>
    licences?: Array<Licence>
    certification?: Array<Licence>
    skills?: Array<string>
    availability?: string
    preferredJobTypes?: Array<string>
    preferredJobLocations?: Array<string>
    preferredJobCategories?: Array<string>
    expectedRatePerHour?: number
    visaType?: string
    visaExpiryDate?: Date
    cv?: string
    coverLetter?: string
}