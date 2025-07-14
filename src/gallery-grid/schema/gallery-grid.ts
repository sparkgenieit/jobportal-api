import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GalleryItem extends Document {
  @Prop({ required: true }) thumb: string;
  @Prop({ required: true }) full: string;
  @Prop({ required: true }) location: string;
  @Prop({ required: true }) category: string;
  @Prop() videoId?: string;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);
