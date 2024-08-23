import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { join } from 'path';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';
import { OrderDto } from 'src/orders/dto/order.dto';
import { Order } from 'src/orders/schema/order.schema';
import { User } from 'src/users/schema/user.schema';
import { invoicePdfCreation } from 'src/utils/functions';
import { Counter } from 'src/utils/Counter.schema';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;
    constructor(
        private emailService: MailerService,
        @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
        @InjectModel('Counter') private readonly counterModel: Model<Counter>,
    ) {
        this.stripe = new Stripe('sk_test_51PKHdMSIkLQ1QpWMKj1xClSWqcOgyIQsd28qfTkD7scrtjZ5Nf2dAijNlyHXlq5a5CCHzEzqwuqJnV9XydBGYz4z00rBFUPxZc');
    }
    async makePayment(plan: string, credits: number, price: number, user_id: any) {
        let priceInCents = price * 100
        let gstAmount = Math.ceil((0.15 * price) * 100)
        let totalAmount = priceInCents + gstAmount;
        const session = await this.stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: plan,
                        },
                        unit_amount: totalAmount,
                    },
                    quantity: 1,
                },
            ],
            metadata: { plan, credits, price: priceInCents, gst: gstAmount, total: totalAmount, user_id },
            mode: 'payment',
            success_url: `http://localhost:3000/payment-status?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `http://localhost:3000/payment-status?success=false`,
        });
        user_id = new mongoose.Types.ObjectId(user_id);
        await this.userModel.findOneAndUpdate({ _id: user_id }, { token: session.id })
        return session
        // let amount = (price * 1000) + +(Math.ceil((price * 1000) * (15 / 100)));
        // const paymentIntent = await this.stripe.paymentIntents.create({
        //     amount: amount,
        //     currency: "usd",
        //     metadata: {
        //         user_id: user_id,
        //         plan: plan,
        //         price: price * 1000
        //     },
        //     // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        //     automatic_payment_methods: {
        //         enabled: true,
        //     },
        // });

        // return { clientSecret: paymentIntent.client_secret }

    }

    async WebhookEvent(data, headers) {
        // const WebHook_secret_key = "whsec_b0ddc5f7a9ed3b81eb1b090a4b2c06ac839b78f5eccad99726a5334b0c710cde";
        // try {
        //     const event = this.stripe.webhooks.constructEvent(
        //         data,
        //         headers,
        //         WebHook_secret_key
        //     );
        //     console.log(event)
        // if (event.type === "charge.succeeded") {
        //     const { price, user_id, plan } = event.data.object.metadata;
        //     const user = await this.userModel.findOneAndUpdate({ _id: user_id }, { plan: plan, price: price })
        //     let userId = new mongoose.Types.ObjectId(user_id)
        //     const profile = await this.companyProfileModel.findOne({ user_id: userId });

        //     await this.emailService.sendMail({
        //         to: user.email,
        //         subject: `[${process.env.APP_NAME}] Payment Completed`,
        //         // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        //         template: 'user/payment_invoice',
        //         context: {
        //             CompanyName: profile.name || "",
        //             date: new Date().toLocaleDateString("en-GB"),
        //             Address1: profile.address1,
        //             Address2: profile.address2,
        //             Address3: profile.address3,
        //             price: price,
        //             gstPrice: (Math.ceil(+price * (15 / 100))),
        //             totalPrice: +(price) + +(Math.ceil(+price * (15 / 100))),
        //             invoiceNumber: `WH${randomUUID()}`
        //         },
        //     });
        //}
        // } catch(error) {
        //     console.log(error);
        // }
    }

    async getSessionDetails(session_id: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(session_id)
            if (session.status === "complete") {
                const { price, user_id, credits, gst, total } = session.metadata;
                let userId = new mongoose.Types.ObjectId(user_id);
                const user = await this.userModel.findOne({ _id: userId })
                if (user.token === session.id) {

                    let [, profile, response] = await Promise.all([
                        this.userModel.findOneAndUpdate({ _id: user_id }, { credits: user.credits + +credits, token: null }),
                        this.companyProfileModel.findOne({ user_id: userId }),
                        this.counterModel.findOneAndUpdate({ counterName: "invoice" }, { $inc: { counterValue: 1 } }, { new: true })
                    ])

                    if (!response) {
                        response = await this.counterModel.create({ counterName: "invoice", counterValue: 1000001 })
                    }

                    const date = new Date()

                    const details = {
                        CompanyName: profile.name || "",
                        CompanyEmail: user.email,
                        date: date.toLocaleDateString("en-GB"),
                        Address1: profile.address1,
                        Address2: profile.address2,
                        Address3: profile.address3,
                        price: +price / 100,
                        gstPrice: +gst / 100,
                        totalPrice: +total / 100,
                        invoiceNumber: response.counterValue
                    }

                    invoicePdfCreation(details);

                    const data: OrderDto = {
                        companyId: user._id,
                        description: "Purchased Job Ad Credits",
                        invoiceNumber: details.invoiceNumber,
                        credits: user.credits + +credits,
                        creditsPurchased: +credits,
                        creditsUsed: 0,
                        amount: +total / 100
                    }
                    await Promise.all(
                        [
                            this.ordersModel.create(data),
                            this.emailService.sendMail({
                                to: user.email,
                                subject: `[${process.env.APP_NAME}] Payment Completed`,
                                template: 'user/payment_invoice',
                                context: details,
                                attachments: [{
                                    filename: `${details.invoiceNumber}.pdf`,
                                    path: join(__dirname, "..", "..", "public", "invoices", `${details.invoiceNumber}.pdf`),
                                    contentType: 'application/pdf'
                                }]
                            })
                        ])
                }
            }
            return session;
        } catch (err) {
            throw new HttpException({ message: 'Cannot get the Payment Status' }, HttpStatus.BAD_REQUEST);
        }
    }
}
