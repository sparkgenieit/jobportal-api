import { Body, Controller, Get, Headers, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('payment')
export class StripeController {
    constructor(private readonly stripeService: StripeService,) { }
    @UseGuards(AuthGuard)
    @Post('make-payment')
    async CreatePaymentIntent(@Body() { plan, credits, price, user_id }) {
        return await this.stripeService.makePayment(plan, credits, price, user_id);
    }

    @Post("webhook-event")
    async WebhookEvent(@Req() req: RawBodyRequest<Request>) {
        const data = req.rawBody
        const sign = req.headers['stripe-signature'];
        return await this.stripeService.WebhookEvent(data, sign);
    }
    @UseGuards(AuthGuard)
    @Get('session-complete/:id')
    async etPaymentIntent(@Param() { id }) {
        return await this.stripeService.getSessionDetails(id)
    }
}
