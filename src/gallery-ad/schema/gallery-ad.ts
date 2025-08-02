
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GalleryAd extends Document {
  @Prop({ required: true }) adTitle: string;
  @Prop({ required: true }) adText: string;
  @Prop({ required: true }) location: string;
  @Prop({ required: true }) category: string;
  @Prop() ctaLink: string;
  @Prop() ctaButton: string;
  @Prop() buttonColor: string;
  @Prop() googleTrackLink: string;
  @Prop() blockImage: string;
  @Prop() blockImageSEO: string;
  @Prop() hoverImage: string;
  @Prop() hoverImageSEO: string;
  @Prop() youtubeLink: string;
}

export const GalleryAdSchema = SchemaFactory.createForClass(GalleryAd);
