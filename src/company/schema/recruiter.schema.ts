import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "src/users/schema/user.schema";

export type RecruiterDocument = HydratedDocument<Recruiter>

@Schema({ timestamps: true })
export class Recruiter {
    @Prop()
    name: string
    @Prop()
    email: string
    @Prop()
    password: string
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    companyId: User
    @Prop()
    token?: string
}

export const RecruiterSchema = SchemaFactory.createForClass(Recruiter);