import { ObjectId } from 'mongodb';
import { IsString, IsUrl, IsEnum, IsOptional, IsDate, IsNotEmpty } from 'class-validator';

export class AdminAdsDto {
  _id: ObjectId;



  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  ad_image_url: string; // For the image URL of the ad

  @IsEnum(['short', 'long','above-menu',  'landing-page']) // Add any other ad types you need
  ad_type: 'short' | 'long' | 'above-menu' | 'landing-page';

  @IsUrl()
  @IsNotEmpty()
  redirect_url: string; // URL to redirect
}
