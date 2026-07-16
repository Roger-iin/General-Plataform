import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth.constants';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponseDto>{
        const { access_token } = await this.authService.login(loginDto);

        response.cookie(AUTH_COOKIE_NAME, access_token, getAuthCookieOptions());

        return { authenticated: true };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) response: Response): LoginResponseDto {
        response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());

        return { authenticated: false };
    }
}
