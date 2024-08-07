import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
    async getOrders(@Param() { companyId }, @Query() { skip, searchTerm, limit }) {
        return await this.orderService.getOrders(companyId, searchTerm, +skip, +limit)
    }

}
