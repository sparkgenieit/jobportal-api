import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CmsDocument = HydratedDocument<Cms>;

@Schema()
export class Cms {
    @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  page: string;

  @Prop({ required: true })
  content: string;
}

export const CmsSchema = SchemaFactory.createForClass(Cms);