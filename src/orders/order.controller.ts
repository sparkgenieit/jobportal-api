import { Controller, Get, Param, Put, Query, Search, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Roles(["employer"])
    @Get("/get/:companyId")
    async getOrders(@Param() { companyId }, @Query() { skip, searchTerm, limit, sort }) {
        return await this.orderService.getOrders(companyId, searchTerm, sort, +skip, +limit)
    }

    @Roles(["employer"])
    @Get("/download-transactions/:companyId")
    async getAllCompanyOrders(@Param() { companyId }, @Query() { from, to }) {
        return await this.orderService.getAllCompanyOrders(companyId, from, to)
    }


    @Roles(["superadmin"])
    @Get("/all")
    async getAllOrders(@Query() { s: search, limit, skip }) {
        return await this.orderService.getAllOrders(search, +limit, +skip)
    }


    @Roles(["superadmin"])
    @Put("/refund-credits/:credits")
    async refundCredits(@Param() { credits }) {
        return await this.orderService.refundCredits(+credits)
    }



}

