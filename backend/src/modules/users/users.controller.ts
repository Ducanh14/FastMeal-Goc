import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
// Giả định bạn đã có JwtAuthGuard từ module Auth (không hiển thị ở đây)
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'; 

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Lưu ý: Route này nên để public để user đăng ký
    const user = await this.usersService.create(createUserDto);
    return { message: 'Đăng ký thành công', userId: user._id };
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user được lấy từ JWT Token sau khi giải mã
    return this.usersService.findById(req.user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const user = await this.usersService.updateRole(id, updateRoleDto.role);
    return { message: 'Cập nhật vai trò thành công', user };
  }
}