// src/auth/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ENV } from 'src/utils/functions';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Roles } from './roles.decorator';  // assume your Roles decorator uses this key

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    // 1) If @Public() -> skip all auth
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    // 2) Otherwise, pull token from cookies
    const token = req.cookies?.Token;
    if (!token || !token.trim()) {
      throw new HttpException(
        { message: 'SESSION EXPIRED! PLEASE SIGN IN' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3) Verify JWT
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: ENV.JWT_SECRET_KEY,
      });
    } catch {
      throw new HttpException(
        { message: 'SESSION EXPIRED! PLEASE SIGN IN' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!payload.role) {
      throw new HttpException(
        { message: 'SESSION EXPIRED! PLEASE SIGN IN' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 4) If @Roles() metadata exists, enforce it
    const requiredRoles = this.reflector.get<string[]>(
      Roles,
      context.getHandler(),
    );
    if (requiredRoles && !requiredRoles.includes(payload.role)) {
      throw new HttpException(
        { message: 'FORBIDDEN REQUEST' },
        HttpStatus.FORBIDDEN,
      );
    }

    // 5) Attach user payload and allow
    req.user = payload;
    return true;
  }
}
