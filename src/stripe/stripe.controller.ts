import { Body, Controller, Get, Headers, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('payment')
export class StripeController {
    constructor(private readonly stripeService: StripeService,) { }
    @UseGuards(AuthGuard)
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
    @UseGuards(AuthGuard)
    @Get('payment-intent/:id')
    async etPaymentIntent(@Param() { id }) {
        return await this.stripeService.GetPaymentIntent(id)
    }


}
