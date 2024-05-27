import { Body, Controller, Get, Headers, Param, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';

@Controller('payment')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('create-payment-intent')
    async CreatePaymentIntent(@Body() { plan, price, user_id }) {
        return await this.stripeService.CreatePaymentIntent(plan, price, user_id);
    }

    @Post("webhook-event")
    async WebhookEvent(@Req() req: RawBodyRequest<Request>) {
        const data = req.rawBody
        const sign = req.headers['stripe-signature'];
        return await this.stripeService.WebhookEvent(data, sign);
    }

    @Get('payment-intent/:id')
    async etPaymentIntent(@Param() { id }) {
        return await this.stripeService.GetPaymentIntent(id)
    }


}
