import { IsNotEmpty, IsString } from "class-validator";

export class AdDto {
    @IsString()
    @IsNotEmpty({ message: "Title should not be empty" })
    title: string

    @IsString()
    @IsNotEmpty({ message: "Description should not be empty" })
    description: string

    @IsString()
    @IsNotEmpty({ message: "Redirect URL should not be empty" })
    redirect_url: string

    @IsString()
    @IsNotEmpty({ message: "Ad type should be provided" })
    ad_type: string

    @IsString()
    @IsNotEmpty({ message: "Ad Image Url should be provided" })
    ad_image_url: string

    created_date?: Date
}

