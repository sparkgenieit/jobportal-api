import { Types } from "mongoose";

export class NotificationDto {
    userId: Types.ObjectId
    jobId: Types.ObjectId
    jobTitle: string
    message: string
    isRead: boolean
    status: string
    createdAt: Date
}

