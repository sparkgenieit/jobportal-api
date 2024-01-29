import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PageDocument = HydratedDocument<Page>;

@Schema()
export class Page{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    page_name: string
    @Prop()
    description: string
    @Prop()
    image: string
}

export const PageSchema = SchemaFactory.createForClass(Page);