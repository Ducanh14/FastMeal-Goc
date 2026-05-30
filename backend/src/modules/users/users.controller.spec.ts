import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../../common/enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            updateRole: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('register returns message and userId', async () => {
    usersService.create.mockResolvedValue({ _id: 'u1' } as any);

    const result = await controller.register({
      fullName: 'User One',
      email: 'u1@test.com',
      password: '123456',
    });

    expect(usersService.create).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Đăng ký thành công', userId: 'u1' });
  });

  it('findById throws NotFoundException when user missing', async () => {
    usersService.findById.mockResolvedValue(null as any);

    await expect(controller.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findById returns user when exists', async () => {
    usersService.findById.mockResolvedValue({ _id: 'u1' } as any);

    const result = await controller.findById('u1');

    expect(result).toEqual({ _id: 'u1' });
  });

  it('getProfile returns user for request userId', async () => {
    usersService.findById.mockResolvedValue({ _id: 'u1' } as any);

    const result = await controller.getProfile({ user: { userId: 'u1' } } as any);

    expect(usersService.findById).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ _id: 'u1' });
  });

  it('updateRole returns updated user', async () => {
    usersService.updateRole.mockResolvedValue({ _id: 'u1', role: Role.ADMIN } as any);

    const result = await controller.updateRole('u1', { role: Role.ADMIN });

    expect(usersService.updateRole).toHaveBeenCalledWith('u1', Role.ADMIN);
    expect(result).toEqual({ message: 'Cập nhật vai trò thành công', user: { _id: 'u1', role: Role.ADMIN } });
  });

  it('deleteUser returns deleted user', async () => {
    usersService.deleteUser.mockResolvedValue({ _id: 'u1' } as any);

    const result = await controller.deleteUser('u1');

    expect(usersService.deleteUser).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ message: 'Xóa người dùng thành công', user: { _id: 'u1' } });
  });
});
