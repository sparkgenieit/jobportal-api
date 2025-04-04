import { Body, Controller, Get, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService,) { }
    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Post('make-payment')
    async CreatePaymentIntent(@Body() { plan, credits, price, selected_days,user_id,creditType }) {
        return await this.paymentService.makePayment(plan, credits, price, selected_days,user_id,creditType);
    }

    @Post("webhook-event")
    async WebhookEvent(@Req() req: RawBodyRequest<Request>) {
        const data = req.rawBody
        const sign = req.headers['stripe-signature'];
        return await this.paymentService.WebhookEvent(data, sign);
    }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Get('session-complete/:id')
    async GetPaymentIntent(@Param() { id }) {
        return await this.paymentService.getSessionDetails(id)
    }
}
