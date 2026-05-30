import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { Role } from '../../common/enums/role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

type UserModelMock = jest.Mock & {
  findOne: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let userModel: UserModelMock;
  const saveMock = jest.fn();

  beforeEach(() => {
    userModel = jest.fn().mockImplementation((doc) => ({
      ...doc,
      save: saveMock,
    })) as unknown as UserModelMock;

    userModel.findOne = jest.fn();
    userModel.find = jest.fn();
    userModel.findById = jest.fn();
    userModel.findByIdAndUpdate = jest.fn();
    userModel.findByIdAndDelete = jest.fn();

    service = new UsersService(userModel as any);
    (bcrypt.hash as jest.Mock).mockReset();
  });

  it('creates a new user with hashed password', async () => {
    userModel.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    saveMock.mockResolvedValue({ _id: 'u1' });

    const result = await service.create({
      fullName: 'User One',
      email: 'u1@test.com',
      password: '123456',
    });

    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'u1@test.com' });
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ _id: 'u1' });
  });

  it('throws ConflictException when email already exists', async () => {
    userModel.findOne.mockResolvedValue({ _id: 'u1' });

    await expect(
      service.create({
        fullName: 'User One',
        email: 'u1@test.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns all users without password sorted by createdAt desc', async () => {
    const execMock = jest.fn().mockResolvedValue([{ _id: 'u1' }]);
    const sortMock = jest.fn().mockReturnValue({ exec: execMock });
    const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
    userModel.find.mockReturnValue({ select: selectMock });

    const result = await service.findAll();

    expect(userModel.find).toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ _id: 'u1' }]);
  });

  it('finds a user by email or username identifier', async () => {
    userModel.findOne.mockResolvedValue({ _id: 'u1' });

    const result = await service.findByIdentifier('u1@test.com');

    expect(userModel.findOne).toHaveBeenCalledWith({
      $or: [{ email: 'u1@test.com' }, { username: 'u1@test.com' }],
    });
    expect(result).toEqual({ _id: 'u1' });
  });

  it('returns user by id without password', async () => {
    const selectMock = jest.fn().mockResolvedValue({ _id: 'u1' });
    userModel.findById.mockReturnValue({ select: selectMock });

    const result = await service.findById('u1');

    expect(userModel.findById).toHaveBeenCalledWith('u1');
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(result).toEqual({ _id: 'u1' });
  });

  it('updates user role and returns user without password', async () => {
    const selectMock = jest.fn().mockResolvedValue({ _id: 'u1', role: Role.ADMIN });
    userModel.findByIdAndUpdate.mockReturnValue({ select: selectMock });

    const result = await service.updateRole('u1', Role.ADMIN);

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { role: Role.ADMIN },
      { new: true },
    );
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(result).toEqual({ _id: 'u1', role: Role.ADMIN });
  });

  it('throws NotFoundException when updating role for missing user', async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    userModel.findByIdAndUpdate.mockReturnValue({ select: selectMock });

    await expect(service.updateRole('missing', Role.ADMIN)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deletes user and returns user without password', async () => {
    const selectMock = jest.fn().mockResolvedValue({ _id: 'u1' });
    userModel.findByIdAndDelete.mockReturnValue({ select: selectMock });

    const result = await service.deleteUser('u1');

    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('u1');
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(result).toEqual({ _id: 'u1' });
  });

  it('throws NotFoundException when deleting missing user', async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    userModel.findByIdAndDelete.mockReturnValue({ select: selectMock });

    await expect(service.deleteUser('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
