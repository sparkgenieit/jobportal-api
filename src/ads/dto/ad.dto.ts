import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose"


export enum AdStatus {
    QUEUE = "QUEUE",
    REVIEW = "REVIEW",
    LIVE = 'LIVE',
    REJECTED = 'REJECTED'
}

export enum AdTypes {
    HOMEBANNER = "home-banner",
    SPECIFIC_PAGE = "specific-page",
     B2B = "b2b"
}

export class AdDto {
    created_date: Date;

    @IsNotEmpty({ message: "Title should not be empty" })
    @IsString({ message: "Invalid Title" })
    title: string;


    @IsNotEmpty({ message: "Description should not be empty" })
    @IsString({ message: "Invalid Description" })
    description: string;


    @IsNotEmpty({ message: "Location should not be empty" })
    @IsString({ message: "Invalid Location" })
    location: string;


    @IsNotEmpty({ message: "End Date should not be empty" })
    end_date: Date | string

    @IsOptional()
    @IsEnum(AdStatus, { message: "Invalid Status" })
    status: AdStatus

    @IsNotEmpty({ message: "Redirect URL should not be empty" })
    @IsString({ message: "Invalid Redirect URL" })
    redirect_url: string

    image: string

    @IsNotEmpty({ message: "Type should not be empty" })
    @IsEnum(AdTypes, { message: "Invalid Type" })
    type: AdTypes

    show_on_pages: [string]

    @IsNotEmpty({ message: "Company ID should not be empty" })
    @IsString({ message: "Invalid Company ID" })
    company_id: string

    @IsNotEmpty({ message: "Created By should not be empty" })
    @IsString({ message: "Invalid Created By" })
    created_by: string

    @IsOptional()
    @IsString({ message: "Invalid Approved By" })
    assigned_to: string

 
    adminId: string




}



