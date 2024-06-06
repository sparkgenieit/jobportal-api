import { Types } from "mongoose";

export class NotificationDto {
    userId: Types.ObjectId
    jobId: Types.ObjectId
    message: string
    isRead: boolean
    status: string
    createdAt: Date
}

