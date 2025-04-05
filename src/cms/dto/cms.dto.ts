import { Types } from "mongoose"
import { IsNotEmpty, IsString } from 'class-validator';


export class CmsDto {
    @IsNotEmpty()
    @IsString()
    category: string;
  
    @IsNotEmpty()
    @IsString()
    page: string;
  
    @IsNotEmpty()
    @IsString()
    content: string;
}

