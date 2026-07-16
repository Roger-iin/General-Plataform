import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  const compareMock = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  const loginDto: LoginDto = {
    email: 'user@example.com',
    password: 'plain-password',
  };

  const user: User = {
    id: 'user-id',
    name: 'Test User',
    email: loginDto.email,
    password: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const usersServiceMock: jest.Mocked<Pick<UsersService, 'findByEmail'>> = {
      findByEmail: jest.fn(),
    };
    const jwtServiceMock: jest.Mocked<Pick<JwtService, 'sign'>> = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token when the credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signed-access-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(compareMock).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({ access_token: 'signed-access-token' });
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(compareMock).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      compareMock.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(compareMock).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
