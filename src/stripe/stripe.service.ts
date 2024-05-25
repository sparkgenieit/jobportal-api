import { Injectable } from '@nestjs/common';
//const stripe = require('stripe')('sk_test_51PKHdMSIkLQ1QpWMKj1xClSWqcOgyIQsd28qfTkD7scrtjZ5Nf2dAijNlyHXlq5a5CCHzEzqwuqJnV9XydBGYz4z00rBFUPxZc');
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;
    constructor() {
        this.stripe = new Stripe('sk_test_51PKHdMSIkLQ1QpWMKj1xClSWqcOgyIQsd28qfTkD7scrtjZ5Nf2dAijNlyHXlq5a5CCHzEzqwuqJnV9XydBGYz4z00rBFUPxZc');
    }
    async CreateCheckout(plan: string, price: number) {
        const session = await this.stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: plan,
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/?success=true`,
            cancel_url: `http://localhost:3000/?canceled=true`,
        });
        return { url: session.url };
    }
}
