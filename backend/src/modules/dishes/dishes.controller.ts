import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
// Import các Guard giả định
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { Role } from 'src/common/enums/role.enum';
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    const showAll = all === 'true';
    return this.dishesService.findAll(!showAll);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.STAFF)
  @Post()
  async create(@Body() createDishDto: CreateDishDto) {
    return this.dishesService.create(createDishDto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDishDto: CreateDishDto) {
    return this.dishesService.update(id, updateDishDto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.dishesService.remove(id);
  }
}