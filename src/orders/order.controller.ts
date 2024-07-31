import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { OrderDto } from './dto/Order.dto';
import { Order } from './schema/Order.schema';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Get("/get/:companyId")
    async getOrders(@Param() { companyId }): Promise<Order[]> {
        return await this.orderService.getOrders(companyId)
    }

}
