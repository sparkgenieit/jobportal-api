import { Body, Controller, Get, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('create-checkout-session')
    async CreateCheckout(@Body() { plan, price }) {
        return await this.stripeService.CreateCheckout(plan, price);
    }



}
