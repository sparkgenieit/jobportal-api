import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { NotificationService } from "./notifications.service";
import { NotificationDto } from "./dto/notifications.dto";

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('create')
    async createNotification(@Body() NotificationDto: NotificationDto) {
        return await this.notificationService.createNotification(NotificationDto);
    }

    @Get('get/:id')
    async getNotification(@Param() data) {
        return await this.notificationService.getNotification(data.id);
    }


    @Get('get-message/:jobId')
    async getRejectedMessage(@Param() data) {
        return await this.notificationService.getRejectedMessage(data.jobId);
    }



}