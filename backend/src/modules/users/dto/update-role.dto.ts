import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'Role phải là customer, staff hoặc admin' })
  @IsNotEmpty()
  role: Role;
}
