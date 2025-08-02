
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGalleryAdDto {
  @IsNotEmpty()
  @IsString()
  adTitle: string;

  @IsNotEmpty()
  @IsString()
  adText: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  ctaLink?: string;

  @IsOptional()
  @IsString()
  ctaButton?: string;

  @IsOptional()
  @IsString()
  buttonColor?: string;

  @IsOptional()
  @IsString()
  googleTrackLink?: string;

  @IsOptional()
  @IsString()
  blockImage?: string;

  @IsOptional()
  @IsString()
  blockImageSEO?: string;

  @IsOptional()
  @IsString()
  hoverImage?: string;

  @IsOptional()
  @IsString()
  hoverImageSEO?: string;

  @IsOptional()
  @IsString()
  youtubeLink?: string;
}
