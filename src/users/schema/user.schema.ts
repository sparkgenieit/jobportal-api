import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    first_name: string
    @Prop()
    last_name: string
    @Prop()
    email: string
    @Prop()
    password: string
    @Prop()
    role: string
    @Prop()
    activated: boolean
    @Prop({ default: false })
    blocked: boolean
    @Prop({ required: false })
    token?: string
    @Prop({ required: false })
    job_credits?: number
    @Prop({ required: false  })
    ad_credits?: number
    @Prop({ required: false  })
    banner_ad_days?: number
    @Prop({ required: false  })
    landing_page_ad_days?: number
    
    @Prop({ required: false })
    usedFreeJobCredit?: boolean
    @Prop({ required: false })
    usedFreeAdCredit?: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);