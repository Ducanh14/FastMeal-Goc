import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    usersService = {
      findByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    authService = new AuthService(usersService);
    (bcrypt.compare as jest.Mock).mockReset();
  });

  it('throws UnauthorizedException when user not found', async () => {
    usersService.findByIdentifier.mockResolvedValue(null as any);

    await expect(authService.login('test@example.com', '123456')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as any);

    await expect(authService.login('u1@test.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns user info when credentials are valid', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as any);

    const result = await authService.login('u1@test.com', '123456');

    expect(result).toEqual({
      userId: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
    });
  });
});
