import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MetaDocument = HydratedDocument<Meta>;

@Schema()
export class Meta {
    @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  keywords: string;
}

export const MetaSchema = SchemaFactory.createForClass(Meta);