import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get(Roles, context.getHandler())
        const request = context.switchToHttp().getRequest();
        const token = (request.cookies.Token);

        if (!token || token.trim() === '') throw new HttpException({ message: 'SESSION EXPIRED! PLEASE SIGN IN' }, HttpStatus.UNAUTHORIZED);

        let data: any = {};
        try {
            data = await this.jwtService.verifyAsync(
                token,
                {
                    secret: "JWT_SECRET_KEY"
                }
            );
        } catch (error) {
            throw new HttpException({ message: 'SESSION EXPIRED! PLEASE SIGN IN' }, HttpStatus.UNAUTHORIZED);
        }

        if (!data.role) throw new HttpException({ message: 'SESSION EXPIRED! PLEASE SIGN IN' }, HttpStatus.UNAUTHORIZED);

        if (roles && !roles.includes(data.role)) throw new HttpException({ message: 'FORBIDDEN REQUEST' }, HttpStatus.FORBIDDEN);

        request.user = data
        return true;
    }
}