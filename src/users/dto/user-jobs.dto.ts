import { Types } from "mongoose";

export class UserJobsDto{
    user_id: Types.ObjectId
    jobId: Types.ObjectId
    type: string
    
}