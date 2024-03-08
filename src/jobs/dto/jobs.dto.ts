import { Types } from "mongoose"

export class JobsDto {
    jobId: Types.ObjectId
    company: string
    closedate: string
    creationdate: string
    jobtype: string
    location: string
    employjobreference: string
    numberofvacancies: number
    jobTitle: string
    rateperhour: number
    duration: string
    jobCategory: string
    subCategory: string
    weeklyperhour: number
    benifits: string
    training: string
    description: string
    employerquestions: string
    employer: string
    status?: string
}

