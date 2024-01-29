import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    category_name: string
    @Prop()
    description: string
    @Prop()
    image: string
}

export const CategorySchema = SchemaFactory.createForClass(Category);