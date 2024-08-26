import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const roles = this.reflector.get(Roles, context.getHandler())
            const request = context.switchToHttp().getRequest();
            const { authorization }: any = request.headers;

            if (!authorization || authorization.trim() === '') throw new HttpException({ message: 'INVALID TOKEN! PLEASE SIGN IN' }, HttpStatus.UNAUTHORIZED);

            const authToken = authorization.replace(/bearer/gim, '').trim();
            const data = await this.jwtService.verifyAsync(
                authToken,
                {
                    secret: "JWT_SECRET_KEY"
                }
            );

            if (!data || !data.role) throw new HttpException({ message: 'INVALID TOKEN! PLEASE SIGN IN' }, HttpStatus.UNAUTHORIZED);

            if (roles && !roles.includes(data.role)) throw new HttpException({ message: 'FORBIDDEN REQUEST' }, HttpStatus.FORBIDDEN);

            return true;
        } catch (error) {
            return false
        }
    }
}