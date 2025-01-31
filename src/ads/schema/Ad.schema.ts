import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { AdStatus, AdTypes } from "../dto/ad.dto";
import { User } from "src/users/schema/user.schema";

export type AdDocument = HydratedDocument<Ad>;

@Schema()
export class Ad {

    @Prop({ default: new Date() })
    date: Date;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true })
    end_date: Date

    @Prop({ required: true })
    status: AdStatus

    @Prop({ required: true })
    redirect_url: string

    @Prop({ required: true })
    image: string

    @Prop({ required: true })
    type: AdTypes

    @Prop()
    show_on_pages: [string]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    company_id: User

    @Prop({ required: true })
    created_by: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    adminId: User
}

export const AdSchema = SchemaFactory.createForClass(Ad);