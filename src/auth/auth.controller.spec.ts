import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import type { Response } from 'express';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth.constants';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'login'>>;

  beforeEach(async () => {
    const authServiceMock: jest.Mocked<Pick<AuthService, 'login'>> = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should store the token in an HttpOnly cookie', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'strong-password',
      };
      const serviceResponse = {
        access_token: 'access-token',
      };
      const responseMock = {
        cookie: jest.fn(),
      } as unknown as Response;
      authService.login.mockResolvedValue(serviceResponse);

      const response = await controller.login(loginDto, responseMock);

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(responseMock.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        serviceResponse.access_token,
        getAuthCookieOptions(),
      );
      expect(response).toEqual<LoginResponseDto>({ authenticated: true });
    });
  });

  describe('logout', () => {
    it('should clear the authentication cookie', () => {
      const responseMock = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const response = controller.logout(responseMock);

      expect(responseMock.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        getAuthCookieOptions(),
      );
      expect(response).toEqual<LoginResponseDto>({ authenticated: false });
    });
  });
});
