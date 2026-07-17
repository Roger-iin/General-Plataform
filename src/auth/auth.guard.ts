import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AUTH_COOKIE_NAME } from "./auth.constants";

@Injectable()
export class AuthGuard {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromCookie(request);
        if(!token) {
            throw new UnauthorizedException('Token não encontrado.');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow<string>('JWT_SECRET'),
            });

            request['user'] = payload;
        } catch {
            throw new UnauthorizedException('Token inválido ou expirado.')
        }
        return true;
    }

    private extractTokenFromCookie(request: Request): string | undefined {
        const cookieHeader = request.headers.cookie;

        if (!cookieHeader) {
            return undefined;
        }

        for (const cookie of cookieHeader.split(';')) {
            const [name, ...valueParts] = cookie.trim().split('=');

            if (name === AUTH_COOKIE_NAME) {
                return decodeURIComponent(valueParts.join('='));
            }
        }

        return undefined;
    }
}
