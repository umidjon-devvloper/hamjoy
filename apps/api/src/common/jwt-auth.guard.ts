import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { env } from '../env';
import type { AuthUser } from './current-user.decorator';

export const PUBLIC_KEY = 'route:public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    const req = ctx.switchToHttp().getRequest<FastifyRequest & { user?: AuthUser }>();
    const header = req.headers['authorization'];
    const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<{ sub: string; role: AuthUser['role'] }>(token, {
          secret: env.JWT_ACCESS_SECRET,
        });
        req.user = { id: payload.sub, role: payload.role };
        return true;
      } catch {
        if (!isPublic) throw new UnauthorizedException({ code: 'invalid_token', message: 'Token yaroqsiz' });
      }
    }

    if (isPublic) return true;
    throw new UnauthorizedException({ code: 'auth_required', message: 'Avtorizatsiya kerak' });
  }
}
