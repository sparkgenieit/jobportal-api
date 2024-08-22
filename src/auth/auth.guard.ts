import {
    CanActivate, ExecutionContext, Injectable, UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const { authorization }: any = request.headers;
            if (!authorization || authorization.trim() === '') {
                throw new UnauthorizedException('Please provide token');
            }
            const authToken = authorization.replace(/bearer/gim, '').trim();
            const data = await this.jwtService.verifyAsync(
                authToken,
                {
                    secret: "JWT_SECRET_KEY"
                }
            );

            return true;

        } catch (error) {
            throw new ForbiddenException(error.message || 'session expired! Please sign In');
        }
    }
}