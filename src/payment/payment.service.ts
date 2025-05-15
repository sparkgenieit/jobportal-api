import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { join } from 'path';
import { CompanyProfile } from 'src/company/schema/companyProfile.schema';
import { OrderDto } from 'src/orders/dto/order.dto';
import { Order } from 'src/orders/schema/order.schema';
import { User } from 'src/users/schema/user.schema';
import { ENV, invoicePdfCreation } from 'src/utils/functions';
import { Counter } from 'src/utils/Counter.schema';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private readonly stripe: Stripe;
    constructor(
        private emailService: MailerService,
        @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(CompanyProfile.name) private readonly companyProfileModel: Model<CompanyProfile>,
        @InjectModel('Counter') private readonly counterModel: Model<Counter>,
    ) {
        this.stripe = new Stripe(ENV.STRIPE_SERVER_KEY);
    }
    async makePayment(plan: string, credits: number, price: number, selected_days:number, user_id: any, creditType:  'job') {
        let priceInCents = price * 100
        let gstAmount = Math.ceil((0.15 * price) * 100)
        let totalAmount = priceInCents + gstAmount;
        const productName = `${credits} ${creditType === 'job' ? 'Job' : 'Ad'} Credits`; // Dynamic product name
        const metadata = {
            plan,
            credits,
            selected_days,
            creditType,
            price: priceInCents,
            gst: gstAmount,
            total: totalAmount,
            user_id,
        };
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
            metadata, // Attach metadata here
            mode: 'payment',
            success_url: `${ENV.BASE_APP_URL}/payment-status?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${ENV.BASE_APP_URL}/payment-status?success=false`,
        });
        user_id = new mongoose.Types.ObjectId(user_id);
        await this.userModel.findOneAndUpdate({ _id: user_id }, { token: session.id })
        return session;
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
            console.log(session);
            if (session.status === "complete") {
                const { price, user_id, credits,selected_days,creditType, gst, total } = session.metadata;
                let userId = new mongoose.Types.ObjectId(user_id);
                const user = await this.userModel.findOne({ _id: userId })
                if (user.token === session.id) {
                    const ad_credits = (creditType == 'ad')?credits:0;
                    const job_credits = (creditType == 'job')?credits:0;
                    const banner_ad_days = (creditType == 'banner_ad')?selected_days:0;
                    const landing_page_ad_days = (creditType == 'landing_page_ad')?selected_days:0;
                    console.log('credits',ad_credits,      '-========',job_credits);
                    let [, profile, response] = await Promise.all([
                        this.userModel.findOneAndUpdate({ _id: user_id }, { job_credits: user.job_credits +  Number(job_credits),ad_credits: user.ad_credits + Number(ad_credits),banner_ad_days: user.banner_ad_days + Number(banner_ad_days),landing_page_ad_days: user.landing_page_ad_days + Number(landing_page_ad_days), token: null }),
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
                        description: `Purchased ${creditType.charAt(0).toUpperCase() + creditType.slice(1)} Credits`,
                        invoiceNumber: details.invoiceNumber,
                        credits: Number(credits),                        
                        creditType,
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
