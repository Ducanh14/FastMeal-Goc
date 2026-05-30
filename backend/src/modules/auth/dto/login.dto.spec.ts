import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto validation', () => {
  it('fails when identifier is missing', async () => {
    const dto = new LoginDto();
    dto.password = '123456';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'identifier')).toBe(true);
  });

  it('fails when password is missing', async () => {
    const dto = new LoginDto();
    dto.identifier = 'u1@test.com';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('passes when identifier and password are provided', async () => {
    const dto = new LoginDto();
    dto.identifier = 'u1@test.com';
    dto.password = '123456';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
