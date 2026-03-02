import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { DailyMenuService } from './daily-menu.service';
import { CreateDailyMenuDto } from './dto/create-daily-menu.dto';

@Controller('daily-menu')
export class DailyMenuController {
  constructor(private readonly dailyMenuService: DailyMenuService) {}

  @Get()
  async getMenu(@Query('date') date: string) {
    return this.dailyMenuService.findByDate(date);
  }

  // Get weekly menus (7 days starting from a given Monday)
  @Get('week')
  async getWeeklyMenu(@Query('startDate') startDate: string) {
    return this.dailyMenuService.findWeek(startDate);
  }

  @Post()
  async createMenu(@Body() createDto: CreateDailyMenuDto, @Request() req) {
    const userId = req.user ? req.user.userId : 'admin_dummy_id'; 
    return this.dailyMenuService.createOrUpdate(createDto, userId);
  }

  // Bulk save weekly menus
  @Post('week')
  async saveWeeklyMenu(@Body() body: { menus: CreateDailyMenuDto[] }, @Request() req) {
    const userId = req.user ? req.user.userId : 'admin_dummy_id';
    const results: any[] = [];
    for (const menu of body.menus) {
      const result = await this.dailyMenuService.createOrUpdate(menu, userId);
      results.push(result);
    }
    return results;
  }
}