import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Pick<Repository<User>, 'findOne' | 'create' | 'save'>>;
  const hashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

  const createUserDto: CreateUserDto = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'plain-password',
  };

  const savedUser: User = {
    id: 'user-id',
    ...createUserDto,
    password: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and save a new user', async () => {
      repository.findOne.mockResolvedValue(null);
      hashMock.mockResolvedValue('hashed-password');
      repository.create.mockReturnValue(savedUser);
      repository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(hashMock).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
      expect(repository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toBe(savedUser);
    });

    it('should throw ConflictException when the email is already in use', async () => {
      repository.findOne.mockResolvedValue(savedUser);

      await expect(service.create(createUserDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(hashMock).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return the user found by email', async () => {
      repository.findOne.mockResolvedValue(savedUser);

      const result = await service.findByEmail(createUserDto.email);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(result).toBe(savedUser);
    });

    it('should return null when the user is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail(createUserDto.email)).resolves.toBeNull();
    });
  });
});
