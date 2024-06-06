import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "./schema/notifications.schema";
import { Model, Types } from "mongoose";
import { NotificationDto } from "./dto/notifications.dto";

@Injectable()
export class NotificationService {
    constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) { }

    async createNotification(NotificationDto: NotificationDto) {
        const { jobId } = NotificationDto;
        const job = await this.notificationModel.findOne({ jobId: jobId });
        if (job) {
            return await this.notificationModel.findOneAndUpdate({ jobId: jobId }, NotificationDto);
        }
        if (!job) {
            return await this.notificationModel.create(NotificationDto);
        }
    }

    async getNotification(userId: Types.ObjectId) {
        return await this.notificationModel.find({ userId: userId })
    }
}