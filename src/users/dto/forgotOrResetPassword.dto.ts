import { LoginUserDto } from "./login-user.dto";
import { PartialType } from '@nestjs/mapped-types';

export class forgotOrResetPasswordDto extends PartialType(LoginUserDto) { }