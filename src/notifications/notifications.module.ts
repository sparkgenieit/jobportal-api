import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Notification, NotificationsSchema } from "./schema/notifications.schema";
import { NotificationController } from "./notifications.controller";
import { JwtService } from "@nestjs/jwt";
import { NotificationService } from "./notifications.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationsSchema },
        ])
    ],
    controllers: [NotificationController],
    providers: [NotificationService, JwtService]
})

export class NotificationModule { }
