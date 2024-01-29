import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AddsDocument = HydratedDocument<Add>;

@Schema()
export class Add{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    add_name: string
    @Prop()
    description: string
    @Prop()
    image: string
}

export const AddSchema = SchemaFactory.createForClass(Add);