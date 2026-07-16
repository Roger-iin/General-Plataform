import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<Pick<UsersService, 'create'>>;

  beforeEach(async () => {
    const usersServiceMock: jest.Mocked<Pick<UsersService, 'create'>> = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and omit the password from the response', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'user@example.com',
        password: 'plain-password',
      };
      const createdUser: User = {
        id: 'user-id',
        ...createUserDto,
        password: 'hashed-password',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      usersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user from the request', () => {
      const authenticatedUser = {
        sub: 'user-id',
        email: 'user@example.com',
      };

      expect(controller.getProfile({ user: authenticatedUser })).toBe(
        authenticatedUser,
      );
    });
  });
});
