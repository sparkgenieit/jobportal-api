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
    @Prop()
    token?: string
    @Prop()
    credits?: number
    @Prop()
    usedFreeCredit?: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);