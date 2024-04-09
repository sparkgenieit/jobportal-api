import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    name: string
    @Prop()
    description: string
    @Prop()
    parent_id: string
    @Prop()
    photo: string
    @Prop()
    status?: string
}

export const AdSchema = SchemaFactory.createForClass(Category);