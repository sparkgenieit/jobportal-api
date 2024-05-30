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

    @Post('create')
    async createOrder(@Body() orderDto: OrderDto): Promise<Order> {
        return await this.orderService.createOrder(orderDto);
    }

    @Get("all")
    async getOrders(): Promise<Order[]> {
        return await this.orderService.getOrders()
    }

    @Put('update/:id')
    async updateDto(@Param() data, @Body() orderDto: OrderDto): Promise<Order[]> {
        console.log("update order id", data.id)
        return await this.orderService.updateOrder(data.id, orderDto);
    }

    @Get(':id')
    async getOrder(@Param() data): Promise<Order[]> {
        console.log(data.id);
        return await this.orderService.getOrder(data.id);
    }
}
