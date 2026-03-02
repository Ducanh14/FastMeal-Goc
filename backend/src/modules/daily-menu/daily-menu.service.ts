import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyMenu } from './schemas/daily-menu.schema';
import { CreateDailyMenuDto } from './dto/create-daily-menu.dto';
import { Dish } from '../dishes/schemas/dish.schema';

@Injectable()
export class DailyMenuService {
  constructor(
    @InjectModel(DailyMenu.name) private dailyMenuModel: Model<DailyMenu>,
    @InjectModel(Dish.name) private dishModel: Model<Dish>, // Inject DishModel để validate
  ) {}

  async createOrUpdate(createDto: CreateDailyMenuDto, adminId: string) {
    const menuDate = new Date(createDto.date);
    menuDate.setHours(0, 0, 0, 0); // Reset giờ

    // Kiểm tra tất cả món ăn có tồn tại không
    const count = await this.dishModel.countDocuments({
      _id: { $in: createDto.dishIds },
    });
    
    if (count !== createDto.dishIds.length) {
      throw new BadRequestException('Một số món ăn không hợp lệ hoặc không tồn tại.');
    }

    // Upsert: Có thì update, chưa có thì tạo mới
    return this.dailyMenuModel.findOneAndUpdate(
      { date: menuDate },
      {
        dishes: createDto.dishIds,
        createdBy: adminId,
      },
      { new: true, upsert: true }
    ).populate('dishes');
  }

  async findByDate(dateStr?: string) {
    let queryDate: Date;
    if (dateStr) {
      queryDate = new Date(dateStr);
    } else {
      queryDate = new Date();
    }
    queryDate.setHours(0, 0, 0, 0);

    return this.dailyMenuModel.findOne({ date: queryDate }).populate('dishes');
  }

  async findWeek(startDateStr?: string) {
    let startDate: Date;
    if (startDateStr) {
      startDate = new Date(startDateStr);
    } else {
      // Default to this week's Monday
      startDate = new Date();
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    }
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const menus = await this.dailyMenuModel
      .find({ date: { $gte: startDate, $lt: endDate } })
      .populate('dishes')
      .sort({ date: 1 });

    // Return a map of day index (0=Monday) to menu
    const result: Record<number, any> = {};
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      
      const menu = menus.find(m => {
        const menuDate = new Date(m.date);
        menuDate.setHours(0, 0, 0, 0);
        return menuDate.getTime() === dayDate.getTime();
      });
      
      result[i] = {
        date: dayDate.toISOString().split('T')[0],
        dishes: menu ? menu.dishes : [],
        _id: menu ? menu._id : null,
      };
    }

    return result;
  }
}