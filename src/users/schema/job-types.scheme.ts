import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type JobTypesDocument = HydratedDocument< JobTypes>;

@Schema()
export class  JobTypes{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    Name: string
    @Prop()
    description: string
    @Prop()
    photo: string
    @Prop()
    password: string
}

export const  JobTypesSchema = SchemaFactory.createForClass( JobTypes);