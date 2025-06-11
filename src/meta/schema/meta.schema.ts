import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Meta {
  @Prop({ required: true })
  page: string;

  @Prop()
  category?: string;

  @Prop()
  title?: string;

  @Prop()
  keywords?: string;

  @Prop()
  description?: string;
}

export type MetaDocument = Meta & Document;
export const MetaSchema = SchemaFactory.createForClass(Meta);
