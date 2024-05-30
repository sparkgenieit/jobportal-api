import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;
    constructor(
        private emailService: MailerService,
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {
        this.stripe = new Stripe('sk_test_51PKHdMSIkLQ1QpWMKj1xClSWqcOgyIQsd28qfTkD7scrtjZ5Nf2dAijNlyHXlq5a5CCHzEzqwuqJnV9XydBGYz4z00rBFUPxZc');
    }
    async CreatePaymentIntent(plan: string, price: number, user_id) {
        // const session = await this.stripe.checkout.sessions.create({
        //     line_items: [
        //         {
        //             price_data: {
        //                 currency: "usd",
        //                 product_data: {
        //                     name: plan,
        //                 },
        //                 unit_amount: price * 100,
        //             },
        //             quantity: 1,
        //         },
        //     ],
        //     mode: 'payment',
        //     success_url: `http://localhost:3000/?success=true`,
        //     cancel_url: `http://localhost:3000/?canceled=true`,
        // });
        // return { url: session.url };
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: price * 1000,
            currency: "inr",
            payment_method: 'pm_card_in',
            metadata: {
                user_id: user_id,
                plan: plan,
                price: price * 1000
            },
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return { clientSecret: paymentIntent.client_secret }

    }

    async WebhookEvent(data, headers) {
        const WebHook_secret_key = "whsec_b0ddc5f7a9ed3b81eb1b090a4b2c06ac839b78f5eccad99726a5334b0c710cde";
        try {
            const event = this.stripe.webhooks.constructEvent(
                data,
                headers,
                WebHook_secret_key
            );
            if (event.type === "charge.succeeded") {
                const { price, user_id, plan } = event.data.object.metadata;
                const user = await this.userModel.findOneAndUpdate({ _id: user_id }, { plan: plan, price: price })
                await this.emailService.sendMail({
                    to: user.email,
                    subject: `[${process.env.APP_NAME}] Payment Completed`,
                    // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
                    template: 'user/payment_invoice',
                    context: {
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                        plan: plan,
                        price: price
                    },
                });


            }



        } catch (error) {
            console.error(error);
        }
    }

    async GetPaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return (paymentIntent); // Send payment intent details
        } catch (err) {
            throw new HttpException({ message: 'Cannot Retrieve the Payment Status' }, HttpStatus.BAD_REQUEST);
        }
    }
}
