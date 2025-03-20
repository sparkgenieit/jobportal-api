import { ObjectId } from 'mongodb';
import { 
  IsString, IsUrl, IsEnum, IsOptional, IsDate, IsNotEmpty, IsMongoId, ValidateIf 
} from 'class-validator';
import { Transform } from 'class-transformer';

// Define an Enum for Ad Types
export enum AdType {
  SHORT = 'short',
  LONG = 'long',
  HOME_PAGE_BANNER = 'home-page-banner',
  LANDING_PAGE = 'landing-page',
}

export class AdminAdsDto {


  @ValidateIf((o) => !o.ad_client) // Only required if ad_client is empty
  @IsString()
  @IsNotEmpty({ message: 'Title is required when Ad Client is empty' })
  title: string;

  @ValidateIf((o) => !o.ad_client)
  @IsString()
  @IsNotEmpty({ message: 'Description is required when Ad Client is empty' })
  description: string;

  @ValidateIf((o) => !o.ad_client)
  @IsUrl()
  @IsNotEmpty({ message: 'Ad Image URL is required when Ad Client is empty' })
  ad_image_url: string;

  @IsEnum(AdType, { message: 'Ad Type must be one of the predefined values' })
  @IsNotEmpty({ message: 'Ad Type is required' })
  ad_type: AdType;

  @ValidateIf((o) => !o.ad_client)
  @IsUrl()
  @IsNotEmpty({ message: 'Redirect URL is required when Ad Client is empty' })
  redirect_url: string;

  @IsOptional()
  @IsString()
  ad_client?: string; // Optional field for Google Ads

  @IsOptional()
  @IsString()
  ad_slot?: string; // Optional field for Google Ads
}
