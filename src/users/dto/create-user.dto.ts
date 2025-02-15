import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator"

export class CreateUserDto {
  created_date: Date

  @IsNotEmpty()
  @IsString()
  first_name: string

  @IsNotEmpty()
  @IsString()
  last_name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsEnum(["superadmin", "admin", "employer", "user"], {
    message: "Valid Role Required"
  })
  role: "superadmin" | "admin" | "employer" | "user"

  activated: boolean
  token?: string
  job_credits?: number
  ad_credits?: number
  
  usedFreeJobCredit?: boolean
  usedFreeAdCredit?: boolean
  
}