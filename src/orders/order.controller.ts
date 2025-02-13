import { Body, Controller, Get, Param, Post, Put, Query, Search, UseGuards, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { OrderDto } from './dto/order.dto';


@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Roles(["superadmin"])
    @Post("/create")
    async createOrder(@Body(ValidationPipe) createOrder: OrderDto) {
        return await this.orderService.createOrder(createOrder)
    }


    @Roles(["employer", "recruiter"])
    @Get("/get/:companyId")
    async getOrders(@Param() { companyId }, @Query() { skip, searchTerm, limit, sort, type }) {
        console.log('type',type);
        return await this.orderService.getOrders(companyId, searchTerm, sort,+skip, +limit,type  )
    }

    @Roles(["employer", "recruiter"])
    @Get("/download-transactions/:companyId")
    async getAllCompanyOrders(@Param() { companyId }, @Query() { from, to }) {
        return await this.orderService.getAllCompanyOrders(companyId, from, to)
    }


    @Roles(["superadmin"])
    @Get("/all")
    async getAllOrders(@Query() { s: search, limit, skip }) {
        return await this.orderService.getAllOrders(search, +limit, +skip)
    }

}

