import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('delegates login to AuthService', async () => {
    const expected = { userId: 'u1', fullName: 'U1', email: 'u1@test.com', role: 'customer' };
    authService.login.mockResolvedValue(expected as any);

    const result = await controller.login({ identifier: 'u1@test.com', password: '123456' });

    expect(authService.login).toHaveBeenCalledWith('u1@test.com', '123456');
    expect(result).toEqual(expected);
  });
});
