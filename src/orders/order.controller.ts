import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Get("/get/:companyId")
    async getOrders(@Param() { companyId }, @Query() { skip, searchTerm, limit, sort }) {
        return await this.orderService.getOrders(companyId, searchTerm, sort, +skip, +limit)
    }

    @Get("/download-transactions/:companyId")
    async getAllOrders(@Param() { companyId, fromDate, toDate }, @Query() { from, to }) {
        return await this.orderService.getAllOrders(companyId, from, to)
    }



}
