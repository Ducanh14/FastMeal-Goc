import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dish } from './schemas/dish.schema';
import { CreateDishDto } from './dto/create-dish.dto';

@Injectable()
export class DishesService {
  constructor(@InjectModel(Dish.name) private dishModel: Model<Dish>) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const newDish = new this.dishModel(createDishDto);
    return newDish.save();
  }

  async findAll(onlyAvailable: boolean = true): Promise<Dish[]> {
    const filter = onlyAvailable ? { isAvailable: true } : {};
    return this.dishModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Dish> {
    const dish = await this.dishModel.findById(id).exec();
    if (!dish) throw new NotFoundException('Món ăn không tồn tại');
    return dish;
  }

  async update(id: string, updateDishDto: CreateDishDto): Promise<Dish> {
    const updatedDish = await this.dishModel
      .findByIdAndUpdate(id, updateDishDto, { new: true })
      .exec();
    if (!updatedDish) throw new NotFoundException('Món ăn không tồn tại');
    return updatedDish;
  }

  async remove(id: string): Promise<Dish> {
    // Soft delete: Chỉ set isAvailable = false
    const removedDish = await this.dishModel.findByIdAndUpdate(id, { isAvailable: false }, { new: true });
    if (!removedDish) throw new NotFoundException('Món ăn không tồn tại');
    return removedDish;
  }
}