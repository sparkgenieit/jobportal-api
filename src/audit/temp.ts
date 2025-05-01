import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type AdLogDocument = HydratedDocument<AdLog>;

@Schema()
export class AdLog {

    @Prop({ default: new Date() })
    date?: Date

    @Prop()
    user_id: string

    @Prop()
    name?: string

    @Prop()
    adId?: string

    
    @Prop()
    adTitle?: string

    @Prop()
    fieldName?: string

    @Prop()
    email?: string

    @Prop()
    username?: string

    @Prop()
    description?: string

    @Prop()
    changedTo?: string

    @Prop()
    changedFrom?: string

}

const AdLogSchema = SchemaFactory.createForClass(AdLog);

AdLogSchema.index({ "$**": "text" })

export { AdLogSchema }