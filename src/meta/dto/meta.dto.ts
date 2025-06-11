import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MetaDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsString()
  page: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
