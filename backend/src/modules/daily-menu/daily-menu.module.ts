import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyMenuController } from './daily-menu.controller';
import { DailyMenuService } from './daily-menu.service';
import { DailyMenu, DailyMenuSchema } from './schemas/daily-menu.schema';
import { Dish, DishSchema } from '../dishes/schemas/dish.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyMenu.name, schema: DailyMenuSchema },
      { name: Dish.name, schema: DishSchema }, // Cần import Dish Schema để Service check tồn tại
    ]),
  ],
  controllers: [DailyMenuController],
  providers: [DailyMenuService],
})
export class DailyMenuModule {}